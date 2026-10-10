"""
Diagnose why no remediation plan / video job was created for the latest test.

Re-runs ONLY the adaptive step (weakness check + written remedial plan) for the
newest graded submission that has an active weak point, with SQL logging off,
and prints the real error if it fails. If it succeeds, the plan is created and
the results page can start the video.

Usage (from backend/):  venv\Scripts\python.exe -m scripts.debug_adaptive
"""
import asyncio
import traceback
import logging
from sqlalchemy import text

import app.main  # noqa: F401  (load all models)
from app import database
database.engine.echo = False
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

from app.database import AsyncSessionLocal
from app.workers.adaptive_consumer import process_test_graded_event


async def main():
    async with AsyncSessionLocal() as db:
        row = (await db.execute(text("""
            SELECT s.id, s.student_id, s.test_id, s.status, s.overall_score
            FROM weakness_flags w JOIN submissions s ON s.id = w.submission_id
            WHERE w.status = 'active'
            ORDER BY w.created_at DESC LIMIT 1
        """))).first()
        if not row:
            print("No active weak point found - take the test again with some wrong answers.")
            return
        print(f"Submission {row.id} | status={row.status} | score={row.overall_score}")
        payload = {"submission_id": str(row.id), "student_id": str(row.student_id), "test_id": str(row.test_id)}
        try:
            result = await process_test_graded_event(payload, db)
            print("RESULT:", result)
            plans = (await db.execute(text("SELECT count(*) FROM remediation_plans"))).scalar()
            print(f"Remediation plans now in database: {plans}")
        except Exception:
            print("\n========== THE REAL ERROR ==========")
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
