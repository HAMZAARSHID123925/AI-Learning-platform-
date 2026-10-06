import asyncio
from sqlalchemy import select, text
from app.database import AsyncSessionLocal
from app.modules.module1_auth.models import User

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT id, email FROM users LIMIT 5"))
        print(res.fetchall())

asyncio.run(check())
