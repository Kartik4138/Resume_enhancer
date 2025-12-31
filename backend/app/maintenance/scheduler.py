import asyncio
from app.db.session import AsyncSessionLocal
from app.maintenance.cleanup import run_cleanup

async def cleanup_loop():
    while True:
        try:
            async with  AsyncSessionLocal() as db:
                await run_cleanup(db)
        except Exception as e:
            print(f"[CLEANUP ERROR] {e}")

        await asyncio.sleep(600)
