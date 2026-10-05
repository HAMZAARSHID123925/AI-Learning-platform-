"""Assessment resource authorization, shared by delivery and submission routes."""
from fastapi import HTTPException
from sqlalchemy import select
from app.modules.module2_content.models import Course, CourseModule, Lesson, CourseStatus, LessonStatus
from app.modules.module4_experience.models import Enrollment
from app.modules.module4_experience.services.progress_service import check_lesson_access, get_course_progress

async def require_target_access(db, user, *, lesson_id=None, course_id=None, generation=False, allow_locked=False, student_mode=False):
    lesson = None
    if lesson_id:
        lesson = await db.get(Lesson, lesson_id)
        if not lesson:
            raise HTTPException(404, "Lesson not found")
        module = await db.get(CourseModule, lesson.module_id)
        course_id = module.course_id
    course = await db.get(Course, course_id) if course_id else None
    if not course:
        raise HTTPException(404, "Course not found")
    if not student_mode and user.has_role("Admin"):
        return course
    if not student_mode and user.has_role("Instructor") and course.instructor_id == user.id:
        return course
    if generation or not user.has_role("Student"):
        raise HTTPException(403, "Course ownership or student access required")
    if course.status != CourseStatus.published or (lesson and lesson.status != LessonStatus.published):
        raise HTTPException(404, "Published content not found")
    enrollment = (await db.execute(select(Enrollment.id).where(Enrollment.student_id == user.id, Enrollment.course_id == course.id, Enrollment.status == "active"))).scalar_one_or_none()
    if not enrollment or (course.grade is not None and course.grade != user.grade):
        raise HTTPException(403, "Active enrollment and matching grade required")
    if lesson and not allow_locked:
        await check_lesson_access(db, lesson.id, user, as_student=True)
    return course

async def require_test_access(db, user, test, *, for_submission=False):
    course = await require_target_access(db, user, lesson_id=test.lesson_id, course_id=test.course_id, allow_locked=test.is_focused_retest, student_mode=for_submission)
    privileged_preview = not for_submission and (user.has_role("Admin") or (user.has_role("Instructor") and course.instructor_id == user.id))
    if test.is_focused_retest and not privileged_preview:
        from app.modules.module6_adaptive.models import RemediationPlan, PlanStatus
        query = select(RemediationPlan.id).where(RemediationPlan.focused_retest_id == test.id, RemediationPlan.student_id == user.id, RemediationPlan.study_completed == True)
        if for_submission:
            query = query.where(RemediationPlan.status == PlanStatus.active)
        plan = (await db.execute(query)).scalar_one_or_none()
        if not plan:
            raise HTTPException(403, "Focused test requires an owned remediation handoff")
    if test.course_id and user.has_role("Student") and not privileged_preview:
        progress = await get_course_progress(db, user.id, test.course_id)
        if not progress["total_lessons"] or progress["completed_lessons"] < progress["total_lessons"]:
            raise HTTPException(403, "Complete the published course lessons first")
