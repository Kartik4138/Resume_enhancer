import uuid
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    token_hash = Column(String, nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(
        UUID(as_uuid=True),
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False
    )

    file_path = Column(Text, nullable=False)
    file_hash = Column(Text, nullable=False)
    parsed_data = Column(JSONB, nullable=True)

    status = Column(String, nullable=False, default="PENDING")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint(
            "resume_id",
            "file_hash",
            name="uq_resume_file_hash"
        ),
    )


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    content = Column(Text, nullable=False)
    content_hash = Column(Text, nullable=False)
    analyzed_data = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "content_hash",
            name="uq_user_jd_hash"
        ),
    )


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    resume_version_id = Column(
        UUID(as_uuid=True),
        ForeignKey("resume_versions.id", ondelete="CASCADE"),
        nullable=False
    )

    job_description_id = Column(
        UUID(as_uuid=True),
        ForeignKey("job_descriptions.id", ondelete="CASCADE"),
        nullable=False
    )

    final_score = Column(Integer, nullable=False)
    breakdown = Column(JSONB, nullable=False)
    result = Column(JSONB, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint(
            "resume_version_id",
            "job_description_id",
            name="uq_resume_jd_result"
        ),
    )
