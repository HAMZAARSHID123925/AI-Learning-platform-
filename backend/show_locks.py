import asyncio
import os
import sys
from pathlib import Path
from sqlalchemy import text
from app.database import AsyncSessionLocal
async def show_locks():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT pid, state, wait_event_type, wait_event, query FROM pg_stat_activity WHERE state != 'idle';"))
        for row in res:
            print(dict(row._mapping))
asyncio.run(show_locks())
