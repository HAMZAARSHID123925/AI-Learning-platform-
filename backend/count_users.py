import asyncio, os, sys
from sqlalchemy import text
from app.database import AsyncSessionLocal
async def count_users():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT count(*) FROM users;"))
        print(f"Total users: {res.scalar()}")
asyncio.run(count_users())
