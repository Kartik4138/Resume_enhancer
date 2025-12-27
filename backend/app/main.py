from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.db.session import engine
from app.db.base import Base

from app.auth.router import router as auth_router
from app.resume.routers import router as resume_router
from app.jobs.router import router as jobs_router
from app.scoring.router import router as scoring_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="ATS Resume Analyzer",
        description="Backend for ATS scoring, resume parsing, and JD matching",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
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
async def init_db():
    """
    1. Connects to the default 'postgres' database to check if our DB exists.
    2. Creates the DB if missing.
    3. Creates all tables within that DB.
    """
    target_db_name = engine.url.database
    system_url = engine.url.set(database="postgres")

    temp_engine = create_async_engine(system_url, isolation_level="AUTOCOMMIT")

    async with temp_engine.connect() as conn:
        # Check if database exists
        result = await conn.execute(
            text(f"SELECT 1 FROM pg_database WHERE datname = '{target_db_name}'")
        )
        exists = result.scalar()

        if not exists:
            print(f" Database '{target_db_name}' does not exist. Creating it now...")
            await conn.execute(text(f'CREATE DATABASE "{target_db_name}"'))
            print(f" Database '{target_db_name}' created successfully!")
        else:
            print(f" Database '{target_db_name}' already exists.")

    await temp_engine.dispose()

    print(" Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(" Tables created successfully.")


@app.get("/health")
async def health():
    return {"status": "ok"}