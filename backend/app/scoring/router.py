import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.db.session import get_session
from app.db.model import (
    Resume,
    ResumeVersion,
    JobDescription,
    AnalysisResult,
    User,
)

from app.llm.gemini import gemini_full_ats_analysis
from app.scoring.scoring import aggregate_ats_score
from app.cache.score_cache import make_score_key, get_cached_score, set_cached_score

router = APIRouter(prefix="/ats", tags=["ATS"])

# -------------------------------------------------------------------------
# 1. SCORE RESUME ENDPOINT (The Core Logic)
# -------------------------------------------------------------------------
@router.post("/score")
async def score_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    # 1️⃣ Fetch Latest PARSED resume for this user [cite: 13, 41]
    res_query = await db.execute(
        select(ResumeVersion)
        .join(Resume)
        .where(
            Resume.user_id == current_user.id,
            ResumeVersion.status == "PARSED"
        )
        .order_by(ResumeVersion.created_at.desc())
        .limit(1)
    )
    resume = res_query.scalar_one_or_none()

    if not resume:
        raise HTTPException(404, "No parsed resume found.")

    # 2️⃣ Fetch Latest analyzed JD for THIS user [cite: 13, 17]
    jd_query = await db.execute(
        select(JobDescription)
        .where(
            JobDescription.user_id == current_user.id,
            JobDescription.analyzed_data.isnot(None)
        )
        .order_by(JobDescription.created_at.desc())
        .limit(1)
    )
    jd = jd_query.scalar_one_or_none()

    if not jd:
        raise HTTPException(404, "No analyzed job description found.")

    # 3️⃣ Cache Check (Using content hashes to prevent collisions)
    resume_text = resume.parsed_data.get("cleaned_text", "")
    jd_text = jd.content

    cache_key = make_score_key(
        user_id=str(current_user.id),
        resume_text=resume_text,
        jd_text=jd_text
    )

    cached = get_cached_score(cache_key)
    if cached:
        return {**cached, "cached": True}

    # 4️⃣ Gemini full analysis (Prompt now includes formatting analysis) [cite: 18, 41]
    try:
        gemini_result = gemini_full_ats_analysis(
            resume_text=resume_text,
            jd_text=jd.content
        )
    except Exception as e:
        raise HTTPException(500, f"AI Analysis failed: {str(e)}")

    # 5️⃣ Updated Scoring: Formatting now comes FROM gemini_result 
    final = aggregate_ats_score(
        gemini_result=gemini_result,
        formatting={}  # Local formatting data is now bypassed in favor of AI analysis
    )

    payload = {
        "skills": gemini_result["skills"],
        "experience": gemini_result["experience"],
        "keywords": gemini_result["keywords"],
        "sections": gemini_result["sections"],
        "formatting": gemini_result.get("formatting", {}),
        "suggestions": gemini_result["suggestions"]
    }

    # 6️⃣ Atomic Upsert (Handles race conditions) [cite: 15, 17]
    stmt = insert(AnalysisResult).values(
        resume_version_id=resume.id,
        job_description_id=jd.id,
        final_score=final["final_ats_score"],
        breakdown=final["score_breakdown"],
        result=payload
    )

    upsert_stmt = stmt.on_conflict_do_update(
        constraint="uq_resume_jd_result", 
        set_={
            "final_score": stmt.excluded.final_score,
            "breakdown": stmt.excluded.breakdown,
            "result": stmt.excluded.result
        }
    )

    await db.execute(upsert_stmt)
    await db.commit()

    # 7️⃣ Build Response
    response = {
        **final,
        **payload,
        "cached": False,
        "resume_id": str(resume.id),  
        "jd_id": str(jd.id)           
    }

    set_cached_score(cache_key, response)
    return response


# -------------------------------------------------------------------------
# 2. FETCH ANALYZED FILE (The exact file used for the score)
# -------------------------------------------------------------------------
@router.get("/latest-analyzed-file")
async def get_latest_analyzed_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Returns the actual PDF file used in the most recent ATS analysis.
    """
    query = (
        select(ResumeVersion.file_path)
        .join(AnalysisResult, AnalysisResult.resume_version_id == ResumeVersion.id)
        .join(Resume, ResumeVersion.resume_id == Resume.id)
        .where(Resume.user_id == current_user.id)
        .order_by(AnalysisResult.created_at.desc())
        .limit(1)
    )
    
    db_result = await db.execute(query)
    row = db_result.one_or_none()

    if not row or not row.file_path:
        raise HTTPException(404, "No analyzed resume file record found.")

    if not os.path.exists(row.file_path):
        raise HTTPException(404, "File missing from server storage.")

    return FileResponse(
        path=row.file_path,
        media_type='application/pdf',
        filename=f"analyzed_resume_{current_user.id}.pdf"
    )

# -------------------------------------------------------------------------
# 3. VERIFY LATEST UPLOAD (Quick check after upload)
# -------------------------------------------------------------------------
@router.get("/latest/verify")
async def verify_latest_upload(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Returns the absolute latest resume file uploaded by the user for verification.
    """
    query = (
        select(ResumeVersion.file_path)
        .join(Resume, ResumeVersion.resume_id == Resume.id)
        .where(Resume.user_id == current_user.id)
        .order_by(ResumeVersion.created_at.desc())
        .limit(1)
    )
    
    result = await db.execute(query)
    row = result.one_or_none()

    if not row or not row.file_path:
        raise HTTPException(404, "No uploaded resume found.")

    if not os.path.exists(row.file_path):
        raise HTTPException(404, "File not found on server.")

    return FileResponse(
        path=row.file_path,
        media_type='application/pdf',
        filename="verify_upload.pdf"
    )