import os
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.model import (
    EmailOTP,
    RefreshToken,
    ResumeVersion,
    AnalysisResult,
    JobDescription
)

OTP_RETENTION_MINUTES = 10
REFRESH_TOKEN_RETENTION_DAYS = 7
RESUME_FILE_TTL_MINUTES = 20
ANALYSIS_RETENTION_DAYS = 30
JD_RETENTION_DAYS = 30

async def run_cleanup(db: AsyncSession):
    now = datetime.utcnow()

    try:
        await cleanup_expired_otps(db, now)
        await cleanup_refresh_tokens(db, now)
        await cleanup_expired_resume_files(db, now)
        await cleanup_old_analysis_results(db, now)
        await cleanup_old_job_descriptions(db, now)

        await db.commit()

    except Exception:
        await db.rollback()
        import logging
        logging.exception("[CLEANUP] Cleanup task failed safely")


async def cleanup_expired_otps(db: AsyncSession, now: datetime):
    await db.execute(
        delete(EmailOTP).where(
            EmailOTP.expires_at < now
        )
    )

async def cleanup_refresh_tokens(db: AsyncSession, now: datetime):
    await db.execute(
        delete(RefreshToken).where(
            RefreshToken.expires_at < now
        )
    )

async def cleanup_expired_resume_files(db: AsyncSession, now: datetime):
    result = await db.execute(
        select(ResumeVersion).where(
            ResumeVersion.expires_at.isnot(None),
            ResumeVersion.expires_at < now
        )
    )

    expired_versions = result.scalars().all()

    for version in expired_versions:
        if version.file_path and os.path.exists(version.file_path):
            try:
                os.remove(version.file_path)
            except Exception as e:
                print(f"[CLEANUP] Failed to delete file {version.file_path}: {e}")

    await db.execute(
        delete(ResumeVersion).where(
            ResumeVersion.expires_at.isnot(None),
            ResumeVersion.expires_at < now
        )
    )



async def cleanup_old_analysis_results(db: AsyncSession, now: datetime):
    cutoff = now - timedelta(days=ANALYSIS_RETENTION_DAYS)

    await db.execute(
        delete(AnalysisResult).where(
            AnalysisResult.created_at < cutoff
        )
    )


async def cleanup_old_job_descriptions(db: AsyncSession, now: datetime):
    cutoff = now - timedelta(days=JD_RETENTION_DAYS)

    await db.execute(
        delete(JobDescription).where(
            JobDescription.created_at < cutoff
        )
    )
