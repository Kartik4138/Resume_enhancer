from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine
from app.db.base import Base

from app.auth.router import router as auth_router
from app.resume.routers import router as resume_router
from app.jobs.router import router as jobs_router
from app.scoring.router import router as scoring_router

import asyncio
from app.maintenance.scheduler import cleanup_loop

from fastapi.middleware.cors import CORSMiddleware

def create_app() -> FastAPI:
    app = FastAPI(
        title="ATS Resume Analyzer",
        description="Backend for ATS scoring, resume parsing, and JD matching",
        version="1.0.0"
    )

    app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",              # local dev
        "http://resume-enhancer-frontend.s3-website-ap-south-1.amazonaws.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )

    # Routers
    app.include_router(auth_router)
    app.include_router(resume_router)
    app.include_router(jobs_router)
    app.include_router(scoring_router)

    return app


app = create_app()

@app.on_event("startup")
async def init_tables():
    print("Checking for tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables check/creation complete.")

    asyncio.create_task(cleanup_loop())
    print("Cleanup scheduler started.")
    
@app.get("/health")
async def health():
    return {"status": "ok"}
