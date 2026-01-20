from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.db.model import User
from app.db.session import get_session
from app.jobs.service import analyze_job_description
from app.auth.schema import JDInput


router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/analyze")
async def analyze_jd(
    payload: JDInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    if not payload or not payload.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a job description"
        )

    return await analyze_job_description(
        content=payload.content,
        user_id=current_user.id,
        db=db
    )

