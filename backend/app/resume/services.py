import hashlib
import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.model import Resume, ResumeVersion
from app.db.session import AsyncSessionLocal

from app.nlp.resume_skill_pipeline import extract_resume_skills_nlp
from app.scoring.formatting_rules import evaluate_formatting
from app.utils.formatting_analyzer import analyze_formatting
from app.utils.resume_parser import clean_text, extract_resume_text

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

async def handle_res_upload(
    file,
    user_id: uuid.UUID,
    db: AsyncSession,
):
    allowed_ext = {".pdf", ".docx"}
    if Path(file.filename).suffix.lower() not in allowed_ext:
        raise ValueError("Unsupported file type")

    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()

    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(content)

    # Get or create Resume
    res = await db.execute(
        select(Resume).where(Resume.user_id == user_id)
    )
    resume = res.scalar_one_or_none()

    if not resume:
        resume = Resume(user_id=user_id)
        db.add(resume)
        await db.flush()

    existing = await db.execute(
        select(ResumeVersion).where(
            ResumeVersion.resume_id == resume.id,
            ResumeVersion.file_hash == file_hash,
        )
    )
    existing_version = existing.scalar_one_or_none()

    if existing_version:
        return {
            "resume_id": str(resume.id),
            "resume_version_id": str(existing_version.id),
            "status": existing_version.status,
            "message": "Resume already uploaded",
        }

    resume_version = ResumeVersion(
        resume_id=resume.id,
        file_path=str(file_path),
        file_hash=file_hash,
        status="PENDING",
    )

    db.add(resume_version)
    await db.commit()

    return {
        "resume_id": str(resume.id),
        "resume_version_id": str(resume_version.id),
        "status": "PENDING",
    }


async def parse_resume_job(resume_version_id: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ResumeVersion).where(
                ResumeVersion.id == resume_version_id
            )
        )
        resume_version = result.scalar_one_or_none()

        if not resume_version or resume_version.status != "PENDING":
            return

        try:
            raw_text = extract_resume_text(resume_version.file_path)
            cleaned_text = clean_text(raw_text)

            formatting_stats = analyze_formatting(cleaned_text)
            formatting_violations = evaluate_formatting(formatting_stats)

            sections = {
                "skills": True,
                "experience": True,
                "projects": True,
                "education": True,
                "certifications": False,
            }

            skills = extract_resume_skills_nlp(
                cleaned_text,
                sections,
            )

            resume_version.parsed_data = {
                "raw_text": raw_text[:5000],
                "cleaned_text": cleaned_text[:5000],
                "formatting": formatting_stats,
                "formatting_violations": formatting_violations,
                "sections_detected": sections,
                "skills": skills,
            }

            resume_version.status = "PARSED"

        except Exception as e:
            resume_version.status = "FAILED"
            resume_version.parsed_data = {
                "error": str(e)
            }

        await db.commit()
