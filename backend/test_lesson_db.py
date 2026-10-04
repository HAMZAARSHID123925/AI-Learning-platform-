import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import get_settings

async def test_db():
    settings = get_settings()
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # Check if columns exist
        res = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lessons' AND column_name IN ('video_url', 'thumbnail_url', 'duration_seconds');"))
        columns = res.fetchall()
        print("Columns:", columns)

        # Check constraint
        try:
            # We need a valid module_id for foreign key constraint
            # Let's just find an existing module or skip insert
            res = await conn.execute(text("SELECT id FROM course_modules LIMIT 1;"))
            module = res.fetchone()
            if module:
                module_id = module[0]
                await conn.execute(text(f"INSERT INTO lessons (id, module_id, title, slug, sequence_order, duration_seconds) VALUES (gen_random_uuid(), '{module_id}', 'test', 'test-slug', 1, -5);"))
                print("FAIL: Inserted negative duration")
            else:
                print("No module found to test insert.")
        except Exception as e:
            print("SUCCESS: Constraint caught negative duration. Error:", type(e).__name__)
    await engine.dispose()

asyncio.run(test_db())
