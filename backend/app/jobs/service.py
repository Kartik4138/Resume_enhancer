import hashlib
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.model import JobDescription
from app.jobs.jd_skill_pipeline import extract_jd_skills


async def analyze_job_description(
    content: str,
    user_id: UUID,
    db: AsyncSession
):
    content_hash = hashlib.sha256(content.encode()).hexdigest()

    result = await db.execute(
        select(JobDescription)
        .where(
            JobDescription.user_id == user_id,
            JobDescription.content_hash == content_hash
        )
    )
    jd = result.scalar_one_or_none()

    if jd:
        return {
            "job_description_id": str(jd.id),
            "skills": jd.analyzed_data["skills"]
        }

    skills = extract_jd_skills(content)

    jd = JobDescription(
        user_id=user_id,
        content=content,
        content_hash=content_hash,
        analyzed_data={"skills": skills}
    )

    db.add(jd)
    await db.commit()

    return {
        "job_description_id": str(jd.id),
        "skills": skills
    }
