import asyncio
from app.database import engine

async def test_conn():
    try:
        async with engine.connect() as conn:
            print("CONNECTION SUCCESSFUL")
    except Exception as e:
        print(f"CONNECTION FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
