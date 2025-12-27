from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr, Field


class EmailInput(BaseModel):
    email: EmailStr


class OTPVerifyInput(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ResumeUploadResponse(BaseModel):
    resume_id: str
    resume_version_id: str
    status: str


class SkillItem(BaseModel):
    name: str
    confidence: float
    source: Optional[List[str]] = None


class ResumeParsedData(BaseModel):
    sections_detected: Dict
    missing_sections: List[str]
    skills: List[SkillItem]
    suggestions: List[str]


class JDInput(BaseModel):
    content: str = Field(min_length=50)


class JDSkill(BaseModel):
    name: str
    confidence: float


class JDAnalysisResponse(BaseModel):
    job_description_id: str
    skills: List[JDSkill]


class ATSScoreBreakdown(BaseModel):
    skills: float
    experience: float
    sections: float
    formatting: float
    keywords: float


class ATSScoreResponse(BaseModel):
    final_ats_score: float
    score_breakdown: ATSScoreBreakdown
    match_percent: float
    matched_skills: List[str]
    missing_skills: List[str]
    weak_skills: List[str]
    suggestions: List[str]
    cached: bool


class AnalysisHistoryItem(BaseModel):
    job_description_id: str
    final_score: int
    breakdown: Dict
    created_at: str


class ResumeVersionHistory(BaseModel):
    resume_version_id: str
    status: str
    created_at: str
    analyses: List[AnalysisHistoryItem]


class ResumeHistoryResponse(BaseModel):
    resume_id: str
    history: List[ResumeVersionHistory]
