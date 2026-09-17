"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/services/dashboard_service.py

Purpose:
    Aggregated Student Dashboard engine with Redis caching.
    Synthesizes data across Module 2 (Curriculum & Lessons), Module 5 (Assessments),
    and Module 6 (Adaptive Remediation) into an ultra-fast (<50ms) single dashboard payload.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course, CourseModule, CourseStatus, Lesson, LessonStatus
from app.modules.module4_experience.models import (
    Enrollment,
    LearningPathState,
    Notification,
    PathState,
    StudentProgress,
)
from app.modules.module4_experience.schemas import (
    ActiveRemediationSummary,
    CourseProgressSummary,
    NextRecommendedLesson,
    SkillMasteryItem,
    StudentDashboardResponse,
)
from app.modules.module5_assessment.models import SkillScore, Submission
from app.modules.module6_adaptive.models import PlanStatus, RemediationPlan, WeaknessFlag, WeaknessStatus
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.shared.exceptions import ResourceNotFoundError
from app.shared.logging_config import get_logger
from app.shared.redis_client import get_redis_client

logger = get_logger(__name__)

DASHBOARD_CACHE_TTL = 300  # 5 minutes


def get_dashboard_cache_key(student_id: uuid.UUID) -> str:
    settings = get_settings()
    return f"{settings.REDIS_KEY_PREFIX}:cache:dashboard:{student_id}"


async def invalidate_dashboard_cache(student_id: uuid.UUID) -> None:
    """
    Evicts the Redis cached dashboard for a student.
    Called when student completes a lesson, submits a test, or finishes remedial study.
    """
    try:
        redis = get_redis_client()
        key = get_dashboard_cache_key(student_id)
        await redis.delete(key)
        logger.info("invalidated_dashboard_cache", student_id=str(student_id))
    except Exception as exc:
        logger.warning("failed_to_invalidate_dashboard_cache", error=str(exc), student_id=str(student_id))


async def get_aggregated_student_dashboard(
    db: AsyncSession,
    student_id: uuid.UUID,
    use_cache: bool = True
) -> StudentDashboardResponse:
    """
    Assembles complete student dashboard.
    Checks Redis cache first; falls back to relational database aggregation.
    """
    cache_key = get_dashboard_cache_key(student_id)

    # 1. Attempt Redis Cache Retrieval
    if use_cache:
        try:
            redis = get_redis_client()
            cached_data = await redis.get(cache_key)
            if cached_data:
                logger.info("dashboard_cache_hit", student_id=str(student_id))
                return StudentDashboardResponse.model_validate_json(cached_data)
        except Exception as exc:
            logger.warning("dashboard_cache_read_error", error=str(exc))

    # 2. Fetch Student User
    user = await db.get(User, student_id)
    if not user:
        raise ResourceNotFoundError("User", student_id)
    student_name = f"{user.first_name} {user.last_name}".strip()

    # 3. Course Progress Aggregation (Only Active Enrollments for this Student)
    courses_query = (
        select(Course)
        .join(Enrollment, Enrollment.course_id == Course.id)
        .where(
            Enrollment.student_id == student_id,
            Enrollment.status == "active",
            Course.status == CourseStatus.published,
        )
        .order_by(Enrollment.enrolled_at.desc())
    )
    courses_res = await db.execute(courses_query)
    courses = courses_res.scalars().all()

    enrolled_courses: list[CourseProgressSummary] = []
    total_system_lessons = 0
    total_system_completed = 0
    next_lesson: NextRecommendedLesson | None = None

    for c in courses:
        # Total published lessons in this course
        l_query = (
            select(Lesson)
            .join(CourseModule, Lesson.module_id == CourseModule.id)
            .where(CourseModule.course_id == c.id, Lesson.status == LessonStatus.published)
            .order_by(CourseModule.sequence_order.asc(), Lesson.sequence_order.asc())
            .options(selectinload(Lesson.module))
        )
        l_res = await db.execute(l_query)
        course_lessons = l_res.scalars().all()
        total_c_lessons = len(course_lessons)

        if total_c_lessons == 0:
            continue

        total_system_lessons += total_c_lessons

        # Get completion map
        prog_query = (
            select(StudentProgress.lesson_id)
            .where(
                StudentProgress.student_id == student_id,
                StudentProgress.completed == True,
                StudentProgress.lesson_id.in_([l.id for l in course_lessons])
            )
        )
        prog_res = await db.execute(prog_query)
        completed_ids = set(prog_res.scalars().all())
        completed_c_count = len(completed_ids)
        total_system_completed += completed_c_count

        # Get locked map
        lock_query = (
            select(LearningPathState.lesson_id)
            .where(
                LearningPathState.student_id == student_id,
                LearningPathState.state == PathState.locked,
                LearningPathState.lesson_id.in_([l.id for l in course_lessons])
            )
        )
        lock_res = await db.execute(lock_query)
        locked_ids = set(lock_res.scalars().all())
        locked_c_count = len(locked_ids)

        pct = round((completed_c_count / total_c_lessons) * 100.0, 1)
        enrolled_courses.append(
            CourseProgressSummary(
                course_id=c.id,
                course_title=c.title,
                course_slug=c.slug,
                total_lessons=total_c_lessons,
                completed_lessons=completed_c_count,
                locked_lessons=locked_c_count,
                percentage=pct
            )
        )

        # Identify next recommended lesson if not yet found
        if next_lesson is None:
            for l in course_lessons:
                if l.id not in completed_ids and l.id not in locked_ids:
                    next_lesson = NextRecommendedLesson(
                        lesson_id=l.id,
                        course_id=c.id,
                        course_title=c.title,
                        module_title=l.module.title if l.module else "Core Module",
                        lesson_title=l.title,
                        lesson_slug=l.slug,
                        sequence_order=l.sequence_order,
                        estimated_minutes=l.estimated_minutes or 15
                    )
                    break

    overall_pct = (
        round((total_system_completed / total_system_lessons) * 100.0, 1)
        if total_system_lessons > 0 else 0.0
    )

    # 4. Skill Mastery Radar Data
    active_weakness_query = select(WeaknessFlag.skill_id).where(
        WeaknessFlag.student_id == student_id,
        WeaknessFlag.status == WeaknessStatus.active
    )
    active_flags_res = await db.execute(active_weakness_query)
    active_weak_skill_ids = set(active_flags_res.scalars().all())

    # Fetch recent skill scores
    skill_scores_query = (
        select(SkillScore.skill_id, func.avg(SkillScore.score / func.coalesce(SkillScore.max_score, 1.0)))
        .join(Submission, SkillScore.submission_id == Submission.id)
        .where(Submission.student_id == student_id)
        .group_by(SkillScore.skill_id)
    )
    scores_res = await db.execute(skill_scores_query)
    skill_averages = {row[0]: float(row[1]) for row in scores_res.all()}

    skills_query = select(SkillTaxonomy).limit(10)
    skills_res = await db.execute(skills_query)
    all_skills = skills_res.scalars().all()

    skill_mastery_radar: list[SkillMasteryItem] = []
    for sk in all_skills:
        avg_score = skill_averages.get(sk.id, 0.70)
        if sk.id in active_weak_skill_ids or avg_score < 0.60:
            status = "needs_remediation"
        elif avg_score >= 0.80:
            status = "mastered"
        else:
            status = "learning"

        skill_mastery_radar.append(
            SkillMasteryItem(
                skill_id=sk.id,
                skill_name=sk.name,
                score=round(avg_score, 2),
                status=status
            )
        )

    # 5. Active Remediation Plans
    rem_query = (
        select(RemediationPlan)
        .where(RemediationPlan.student_id == student_id, RemediationPlan.status == PlanStatus.active)
        .options(selectinload(RemediationPlan.weakness_flag))
    )
    rem_res = await db.execute(rem_query)
    active_plans = rem_res.scalars().all()

    active_remediations: list[ActiveRemediationSummary] = []
    for p in active_plans:
        flag = p.weakness_flag
        sk_name = "Target Skill"
        if flag:
            sk_obj = await db.get(SkillTaxonomy, flag.skill_id)
            if sk_obj:
                sk_name = sk_obj.name

        active_remediations.append(
            ActiveRemediationSummary(
                remediation_plan_id=p.id,
                skill_id=flag.skill_id if flag else uuid.uuid4(),
                skill_name=sk_name,
                title=p.remedial_course_title or f"Remediation: {sk_name}",
                study_completed=p.study_completed,
                retest_attempt_count=p.retest_attempt_count,
                instructor_escalated=p.instructor_escalated
            )
        )

    # 6. Unread Notifications Count
    notif_query = select(func.count(Notification.id)).where(
        Notification.student_id == student_id,
        Notification.read == False
    )
    notif_res = await db.execute(notif_query)
    unread_count = notif_res.scalar_one() or 0

    now = datetime.now(timezone.utc)
    dashboard = StudentDashboardResponse(
        student_id=student_id,
        student_name=student_name,
        enrolled_courses=enrolled_courses,
        overall_completion_percentage=overall_pct,
        next_recommended_lesson=next_lesson,
        skill_mastery_radar=skill_mastery_radar,
        active_remediations=active_remediations,
        unread_notifications_count=unread_count,
        cached_at=now
    )

    # 7. Write to Redis Cache
    try:
        redis = get_redis_client()
        await redis.setex(cache_key, DASHBOARD_CACHE_TTL, dashboard.model_dump_json())
        logger.info("dashboard_cached_successfully", student_id=str(student_id))
    except Exception as exc:
        logger.warning("dashboard_cache_write_error", error=str(exc))

    return dashboard
