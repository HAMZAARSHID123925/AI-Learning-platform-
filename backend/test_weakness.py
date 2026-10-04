import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.modules.module5_assessment.models import Submission, SkillScore, SubmissionStatus, GraderType, Test, Question, QuestionType
from app.modules.module6_adaptive.models import WeaknessFlag
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.modules.module6_adaptive.services.weakness_detector import evaluate_submission_skills_for_weaknesses

async def test_weakness_detector():
    async with AsyncSessionLocal() as db:
        # Get random student
        student = (await db.execute(select(User).limit(1))).scalar_one_or_none()
        if not student:
            print("No student found")
            return
            
        # Get random skill
        skill = (await db.execute(select(SkillTaxonomy).limit(1))).scalar_one_or_none()
        if not skill:
            print("No skill found")
            return
            
        # Get random course
        course = (await db.execute(select(Course).limit(1))).scalar_one_or_none()

        # Create fake test
        test = Test(id=uuid.uuid4(), title="Test Weakness", is_focused_retest=False, course_id=course.id if course else None)
        db.add(test)
        await db.flush()
        
        # Create fake submission
        sub = Submission(
            id=uuid.uuid4(),
            test_id=test.id,
            student_id=student.id,
            attempt_number=1,
            status=SubmissionStatus.graded,
            overall_score=0.4
        )
        db.add(sub)
        await db.flush()
        
        # Create fake skill score (below 0.6)
        score = SkillScore(
            id=uuid.uuid4(),
            submission_id=sub.id,
            skill_id=skill.id,
            score=0.5,
            max_score=1.0,
            grader_type=GraderType.deterministic
        )
        db.add(score)
        await db.flush()
        await db.commit()
        
        print(f"Created Submission {sub.id} with SkillScore {score.score}/{score.max_score}")
        
        # Run detector
        new_flags, resolved_flags = await evaluate_submission_skills_for_weaknesses(sub, db)
        
        print(f"New Weakness Flags: {len(new_flags)}")
        if new_flags:
            flag = new_flags[0]
            print(f"Flag ID: {flag.id}, Skill: {flag.skill_id}, Score: {flag.score_at_flag}, Status: {flag.status.value}")
        
        print(f"Resolved Weakness Flags: {len(resolved_flags)}")
        
        # We leave the data in the database so test_video_job.py can use it.
        # But we write it to a file so we can clean it up later if we want.
        with open("test_flag_id.txt", "w") as f:
            if new_flags:
                f.write(str(new_flags[0].id))


if __name__ == "__main__":
    asyncio.run(test_weakness_detector())
