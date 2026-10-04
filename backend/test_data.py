import asyncio
import uuid
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course

async def main():
    async with AsyncSessionLocal() as db:
        # Step 7: Verify Grade Filtering logic via DB
        # Step 9: Existing Data Safety
        
        # Check users
        users = await db.execute(select(User))
        users = users.scalars().all()
        print(f"Users found: {len(users)}")
        for u in users:
            print(f" User: {u.email}, Grade: {u.grade}")
            
        # Check courses
        courses = await db.execute(select(Course))
        courses = courses.scalars().all()
        print(f"Courses found: {len(courses)}")
        for c in courses:
            print(f" Course: {c.title}, Grade: {c.grade}")

if __name__ == "__main__":
    asyncio.run(main())
