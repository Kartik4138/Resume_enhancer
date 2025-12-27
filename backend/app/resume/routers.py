from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
import os

from app.auth.deps import get_current_user
from app.auth.schema import ResumeHistoryResponse, ResumeUploadResponse
from app.db.model import AnalysisResult, Resume, ResumeVersion, User
from app.db.session import get_session
from app.resume.services import handle_res_upload, parse_resume_job
from fastapi.responses import FileResponse

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload")
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    existing_versions_query = await db.execute(
        select(ResumeVersion)
        .join(Resume)
        .where(Resume.user_id == current_user.id)
    )
    old_versions = existing_versions_query.scalars().all()

    for old in old_versions:
        if old.file_path and os.path.exists(old.file_path):
            try:
                os.remove(old.file_path)
            except Exception as e:
                print(f"Error deleting file {old.file_path}: {e}")
        
        await db.execute(
            delete(AnalysisResult).where(AnalysisResult.resume_version_id == old.id)
        )
        await db.delete(old)
    
    await db.commit()

    result = await handle_res_upload(
        file=file,
        user_id=current_user.id,
        db=db
    )

    file_path = result.get("file_path") 

    background_tasks.add_task(
        parse_resume_job,
        result["resume_version_id"]
    )

    if file_path and os.path.exists(file_path):
        return FileResponse(
            path=file_path, 
            filename=file.filename, 
            media_type='application/pdf'
        )
    
    return result

@router.get("/history", response_model=ResumeHistoryResponse)
async def resume_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    res = await db.execute(
        select(Resume)
        .where(
            Resume.user_id == current_user.id
        )
    )
    resume = res.scalar_one_or_none()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    versions_res = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == resume.id)
        .order_by(ResumeVersion.created_at.desc())
    )
    versions = versions_res.scalars().all()

    history = []

    for version in versions:
        analysis_res = await db.execute(
            select(AnalysisResult)
            .where(AnalysisResult.resume_version_id == version.id)
            .order_by(AnalysisResult.created_at.desc())
        )
        analyses = analysis_res.scalars().all()

        history.append({
            "resume_version_id": str(version.id),
            "status": version.status,
            "created_at": version.created_at.isoformat(),
            "analyses": [
                {
                    "job_description_id": str(a.job_description_id),
                    "final_score": a.final_score,
                    "breakdown": a.breakdown,
                    "created_at": a.created_at.isoformat()
                }
                for a in analyses
            ]
        })

    return {
        "resume_id": str(resume.id),
        "history": history
    }

@router.get("/latest-analyzed-file")
async def get_latest_analyzed_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    query = (
        select(ResumeVersion.file_path, ResumeVersion.file_hash)
        .join(AnalysisResult, AnalysisResult.resume_version_id == ResumeVersion.id)
        .join(Resume, ResumeVersion.resume_id == Resume.id)
        .where(Resume.user_id == current_user.id)
        .order_by(AnalysisResult.created_at.desc())
        .limit(1)
    )
    
    result = await db.execute(query)
    resume_info = result.one_or_none()

    if not resume_info:
        raise HTTPException(404, "No analyzed resume found for this user")

    file_path = resume_info.file_path

    if not os.path.exists(file_path):
        raise HTTPException(404, "Resume file not found on server")

    return FileResponse(
        path=file_path,
        media_type='application/pdf',
        filename=f"analyzed_resume_{current_user.id}.pdf"
    )

@router.get("/latest/verify")
async def verify_latest_upload(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
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
        raise HTTPException(status_code=404, detail="No uploaded resume found to verify.")

    if not os.path.exists(row.file_path):
        raise HTTPException(status_code=404, detail="File path exists in DB but file is missing from storage.")

    return FileResponse(
        path=row.file_path,
        media_type='application/pdf',
        filename="verify_upload.pdf"
    )