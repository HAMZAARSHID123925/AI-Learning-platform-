"""
ELARION AI Learning Platform — Backend
Module: app/modules/module4_experience/services/dashboard_service.py

Purpose:
    Aggregated Student Dashboard engine with Redis caching.
    Synthesizes data across Module 2 (Curriculum & Lessons), Module 5 (Assessments),
    and Module 6 (Adaptive Remediation) using bounded summary reads and a display cache.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from collections import defaultdict

from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.modules.module1_auth.models import User
from app.modules.module2_content.models import Course, CourseModule, CourseStatus, Lesson, LessonStatus, LessonSkill
from app.modules.module4_experience.models import (
    Enrollment,
    LearningPathState,
    Notification,
    PathState,
    StudentProgress,
)
from app.modules.module4_experience.schemas import (
    ActiveRemediationSummary,
    DashboardCourseCard,
    CourseProgressSummary,
    NextRecommendedLesson,
    SkillMasteryItem,
    StudentDashboardResponse,
)
from app.modules.module5_assessment.models import SkillScore, Submission, Test, SubmissionStatus
from app.modules.module6_adaptive.models import PlanStatus, RemediationPlan, WeaknessFlag, WeaknessStatus
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy
from app.shared.exceptions import ResourceNotFoundError, AuthorizationError
from app.shared.logging_config import get_logger
from app.shared.redis_client import get_redis_client

logger = get_logger(__name__)

DASHBOARD_CACHE_TTL = 300  # 5 minutes


def get_dashboard_cache_key(student_id: uuid.UUID) -> str:
    settings = get_settings()
    return f"{settings.REDIS_KEY_PREFIX}:cache:dashboard:v3:{student_id}"


async def invalidate_dashboard_cache(student_id: uuid.UUID) -> None:
    """
    Evicts the Redis cached dashboard for a student.
    Called when student completes a lesson, submits a test, or finishes remedial study.
    """
    try:
        redis = get_redis_client()
        key = get_dashboard_cache_key(student_id)
        await redis.eval("redis.call('INCR', KEYS[2]); return redis.call('DEL', KEYS[1])", 2, key, key + ":revision")
        logger.info("invalidated_dashboard_cache", student_id=str(student_id))
    except Exception as exc:
        logger.warning("failed_to_invalidate_dashboard_cache", error=str(exc), student_id=str(student_id))


async def get_aggregated_student_dashboard(
    db: AsyncSession,
    student_id: uuid.UUID,
    use_cache: bool = True,
    instructor_id: uuid.UUID | None = None
) -> StudentDashboardResponse:
    """
    Assembles complete student dashboard.
    Checks Redis cache first; falls back to relational database aggregation.
    """
    cache_key = get_dashboard_cache_key(student_id)
    use_cache = use_cache and instructor_id is None

    # Always scope display cache to authoritative identity/grade. Auth and
    # lesson access remain outside this cache. Staff views never share it.
    user = (await db.execute(select(User.first_name, User.last_name, User.grade).where(User.id == student_id))).first()
    if not user:
        raise ResourceNotFoundError("User", student_id)
    student_name = f"{user.first_name} {user.last_name}".strip()
    revision = "0"
    if use_cache:
        try:
            redis = get_redis_client()
            current_revision, cached_data = await redis.mget(cache_key + ":revision", cache_key)
            revision = current_revision.decode() if isinstance(current_revision, bytes) else str(current_revision or "0")
            if cached_data:
                envelope = json.loads(cached_data)
                if envelope["revision"] == revision and envelope["grade"] == user.grade:
                    dashboard = StudentDashboardResponse.model_validate(envelope["payload"])
                    if dashboard.student_id == student_id:
                        # Profile display must not remain stale after a profile update.
                        dashboard.student_name = student_name
                        return await _prepare_dashboard_media(dashboard)
        except Exception as exc:
            logger.warning("dashboard_cache_read_error", error_type=type(exc).__name__)

    # 3. Course Progress Aggregation (Only Active Enrollments for this Student)
    courses_query = (
        select(Course.id, Course.title, Course.slug)
        .join(Enrollment, Enrollment.course_id == Course.id)
        .where(
            Enrollment.student_id == student_id,
            Enrollment.status == "active",
            Course.status == CourseStatus.published,
        )
        .order_by(Enrollment.enrolled_at.desc())
    )
    if instructor_id is not None:
        courses_query = courses_query.where(Course.instructor_id == instructor_id)
    courses_res = await db.execute(courses_query)
    courses = courses_res.all()

    if instructor_id is not None and not courses:
        raise AuthorizationError("Student is not enrolled in an assigned course.")
    scoped_lessons = select(Lesson.id).join(CourseModule).where(CourseModule.course_id.in_([c.id for c in courses]))
    scoped_tests = select(Test.id).where(or_(Test.course_id.in_([c.id for c in courses]), Test.lesson_id.in_(scoped_lessons)))
    scoped_submissions = select(Submission.id).where(Submission.student_id == student_id, Submission.test_id.in_(scoped_tests))

    enrolled_courses: list[CourseProgressSummary] = []
    total_system_lessons = 0
    total_system_completed = 0
    next_lesson: NextRecommendedLesson | None = None

    # Three set-based reads, independent of course count. No ORM graphs.
    course_ids = [c.id for c in courses]
    lesson_rows = (await db.execute(
        select(CourseModule.course_id, CourseModule.title.label("module_title"),
               Lesson.id, Lesson.title, Lesson.slug, Lesson.sequence_order, Lesson.estimated_minutes,
               StudentProgress.completed, LearningPathState.state)
        .join(Lesson, Lesson.module_id == CourseModule.id)
        .outerjoin(StudentProgress, (StudentProgress.lesson_id == Lesson.id) & (StudentProgress.student_id == student_id))
        .outerjoin(LearningPathState, (LearningPathState.lesson_id == Lesson.id) & (LearningPathState.student_id == student_id))
        .where(CourseModule.course_id.in_(course_ids), Lesson.status == LessonStatus.published)
        .order_by(CourseModule.sequence_order, Lesson.sequence_order)
    )).all()
    by_course = defaultdict(list)
    for row in lesson_rows:
        by_course[row.course_id].append(row)
    published_lessons = select(Lesson.id).join(CourseModule).where(
        CourseModule.course_id == Course.id, Lesson.status == LessonStatus.published).correlate(Course)
    ranked_latest = (select(Course.id.label("course_id"), Submission.id, Submission.status,
        func.row_number().over(partition_by=Course.id, order_by=Submission.submitted_at.desc()).label("rank"))
        .select_from(Course).join(Test, or_(Test.course_id == Course.id, Test.lesson_id.in_(published_lessons)))
        .join(Submission, Submission.test_id == Test.id)
        .where(Course.id.in_(course_ids), Submission.student_id == student_id)).subquery()
    latest_by_course = {r.course_id: r for r in (await db.execute(
        select(ranked_latest).where(ranked_latest.c.rank == 1))).all()}
    for c in courses:
        rows = by_course[c.id]
        course_lessons = [SimpleNamespace(id=r.id, title=r.title, slug=r.slug,
            sequence_order=r.sequence_order, estimated_minutes=r.estimated_minutes,
            module=SimpleNamespace(title=r.module_title)) for r in rows]
        total_c_lessons = len(rows)
        if not total_c_lessons:
            continue
        total_system_lessons += total_c_lessons
        completed_ids = {r.id for r in rows if r.completed}
        locked_ids = {r.id for r in rows if r.state == PathState.locked}
        completed_c_count = len(completed_ids)
        locked_c_count = len(locked_ids)
        total_system_completed += completed_c_count
        latest = latest_by_course.get(c.id)
        pct = round((completed_c_count / total_c_lessons) * 100.0, 1)
        enrolled_courses.append(
            CourseProgressSummary(
                course_id=c.id,
                course_title=c.title,
                course_slug=c.slug,
                total_lessons=total_c_lessons,
                completed_lessons=completed_c_count,
                locked_lessons=locked_c_count,
                percentage=pct,
                assessment_status=("completed" if latest.status == SubmissionStatus.graded else "in_progress") if latest else "not_started",
                latest_submission_id=latest.id if latest else None
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
    if instructor_id is not None:
        active_weakness_query = active_weakness_query.where(WeaknessFlag.submission_id.in_(scoped_submissions))
    active_flags_res = await db.execute(active_weakness_query)
    active_weak_skill_ids = set(active_flags_res.scalars().all())

    # Latest graded result per skill defines the current mastery state; averaging
    # previous failures would keep a resolved skill incorrectly in remediation.
    ranked_scores = (
        select(SkillScore.skill_id,
               (SkillScore.score / func.nullif(SkillScore.max_score, 0)).label("ratio"),
               func.row_number().over(partition_by=SkillScore.skill_id,
                   order_by=(Submission.submitted_at.desc(), SkillScore.id.desc())).label("rank"))
        .join(Submission, SkillScore.submission_id == Submission.id)
        .where(Submission.student_id == student_id, Submission.status == SubmissionStatus.graded)
    )
    if instructor_id is not None:
        ranked_scores = ranked_scores.where(Submission.id.in_(scoped_submissions))
    ranked = ranked_scores.subquery()
    scores_res = await db.execute(select(ranked.c.skill_id, ranked.c.ratio).where(ranked.c.rank == 1))
    skill_scores = {row[0]: float(row[1]) for row in scores_res.all() if row[1] is not None}

    curriculum_skills = select(LessonSkill.skill_id).where(LessonSkill.lesson_id.in_(scoped_lessons))
    skills_query = select(SkillTaxonomy.id, SkillTaxonomy.name).where(or_(SkillTaxonomy.id.in_(curriculum_skills), SkillTaxonomy.id.in_(list(skill_scores)))).order_by(SkillTaxonomy.name)
    skills_res = await db.execute(skills_query)
    all_skills = skills_res.all()

    skill_mastery_radar: list[SkillMasteryItem] = []
    for sk in all_skills:
        avg_score = skill_scores.get(sk.id, 0.0)
        if sk.id not in skill_scores and sk.id not in active_weak_skill_ids:
            status = "not_assessed"
        elif sk.id in active_weak_skill_ids or avg_score < 0.60:
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
    rem_query = (select(RemediationPlan.id, RemediationPlan.remedial_course_title,
        RemediationPlan.study_completed, RemediationPlan.retest_attempt_count,
        RemediationPlan.instructor_escalated, WeaknessFlag.skill_id, SkillTaxonomy.name.label("skill_name"))
        .outerjoin(WeaknessFlag, WeaknessFlag.id == RemediationPlan.weakness_flag_id)
        .outerjoin(SkillTaxonomy, SkillTaxonomy.id == WeaknessFlag.skill_id)
        .where(RemediationPlan.student_id == student_id,
               RemediationPlan.status.in_([PlanStatus.active, PlanStatus.escalated])))
    if instructor_id is not None:
        rem_query = rem_query.where(WeaknessFlag.submission_id.in_(scoped_submissions))
    active_plans = (await db.execute(rem_query)).all()
    active_remediations: list[ActiveRemediationSummary] = []
    for p in active_plans:
        sk_name = p.skill_name or "Target Skill"
        active_remediations.append(
            ActiveRemediationSummary(
                remediation_plan_id=p.id,
                skill_id=p.skill_id if p.skill_id else uuid.uuid4(),
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
    # Notifications have no course scope; keep private totals out of instructor views.
    unread_count = 0
    if instructor_id is None:
        notif_res = await db.execute(notif_query)
        unread_count = notif_res.scalar_one() or 0

    # Grade catalog preserves the existing Dashboard page's published-course
    # semantics separately from enrolled progress, including zero-lesson cards.
    cards = []
    if instructor_id is None:
        catalog = (await db.execute(select(Course.id, Course.slug, Course.title, Course.description,
            Course.grade, Course.thumbnail_url, Course.thumbnail_object_key)
            .where(Course.grade == (user.grade or 5), Course.status == CourseStatus.published)
            .order_by(Course.created_at.desc(), Course.id))).mappings().all()
        cards = [DashboardCourseCard(**r) for r in catalog]
        card_by_id = {c.id: c for c in cards}
        if cards:
            refs = (await db.execute(select(CourseModule.course_id, Lesson.id, Lesson.title,
                Lesson.sequence_order, Lesson.estimated_minutes,
                StudentProgress.completed, LearningPathState.state)
                .join(Lesson, Lesson.module_id == CourseModule.id)
                .outerjoin(StudentProgress, (StudentProgress.lesson_id == Lesson.id) & (StudentProgress.student_id == student_id))
                .outerjoin(LearningPathState, (LearningPathState.lesson_id == Lesson.id) & (LearningPathState.student_id == student_id))
                .where(CourseModule.course_id.in_(card_by_id), Lesson.status == LessonStatus.published)
                .order_by(CourseModule.sequence_order, CourseModule.id, Lesson.sequence_order, Lesson.id))).all()
            from app.modules.module4_experience.schemas import DashboardLessonReference
            for r in refs:
                card_by_id[r.course_id].lessons.append(DashboardLessonReference(id=r.id, title=r.title,
                    sequence_order=r.sequence_order, minutes=r.estimated_minutes or 5,
                    completed=bool(r.completed), locked=r.state == PathState.locked))

    now = datetime.now(timezone.utc)
    dashboard = StudentDashboardResponse(
        student_id=student_id,
        student_name=student_name,
        course_cards=cards,
        enrolled_courses=enrolled_courses,
        overall_completion_percentage=overall_pct,
        next_recommended_lesson=next_lesson,
        skill_mastery_radar=skill_mastery_radar,
        active_remediations=active_remediations,
        unread_notifications_count=unread_count,
        cached_at=now
    )

    if use_cache:
        try:
            # Cache unsigned references only; sign visible images on every response.
            payload = dashboard.model_dump(mode="json")
            payload["course_cards"] = [dict(c.model_dump(mode="json"), thumbnail_object_key=c.thumbnail_object_key) for c in cards]
            envelope = json.dumps({"revision": revision, "grade": user.grade, "payload": payload})
            redis = get_redis_client()
            # A mutation during aggregation must not repopulate a stale cache.
            await redis.eval("if (redis.call('GET', KEYS[2]) or '0') == ARGV[1] then return redis.call('SETEX', KEYS[1], ARGV[2], ARGV[3]) else return 0 end",
                2, cache_key, cache_key + ":revision", revision, DASHBOARD_CACHE_TTL, envelope)
        except Exception as exc:
            logger.warning("dashboard_cache_write_error", error_type=type(exc).__name__)
    return await _prepare_dashboard_media(dashboard)


async def _prepare_dashboard_media(dashboard: StudentDashboardResponse) -> StudentDashboardResponse:
    from app.shared.s3_client import generate_presigned_url
    for card in dashboard.course_cards:
        if card.thumbnail_object_key and not (card.thumbnail_url and '/static/uploads/' in card.thumbnail_url):
            card.thumbnail_url = await generate_presigned_url(card.thumbnail_object_key,
                expires_in=get_settings().MEDIA_SIGNED_URL_TTL_SECONDS)
    return dashboard
