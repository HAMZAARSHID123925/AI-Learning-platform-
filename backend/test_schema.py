import asyncio
from app.database import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"))
        print(res.fetchall())

if __name__ == "__main__":
    asyncio.run(main())
