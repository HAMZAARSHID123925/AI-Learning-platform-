# 05 — ADAPTIVE LEARNING LOOP & EVENTS
## ELARION Platform — TestGraded Event Specification, Weakness Detection, State Machine & Retest Logic

> **Document Type:** Adaptive System Specification
> **Covers:** TestGraded event contract, Module 6 consumer, weakness rules, LearningPathState machine, remediation planning, retest loop, instructor escalation

---

## 1. The Adaptive Loop — Complete Picture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Student submits test                        │
│                          (Module 4 → M5)                           │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Grading Pipeline (M5)                          │
│                                                                     │
│   MCQ → Deterministic                                               │
│   Short Answer → Claude Grader                                      │
│   Aggregate → skill_scores written to DB                           │
│   submissions.status = 'graded'                                    │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                                │ emit TestGraded event
                                ▼
                 ┌──────────────────────────┐
                 │   Redis Streams          │
                 │   elarion:events:test_graded │
                 └──────────────┬───────────┘
                                │ consumed by
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                 Module 6 Consumer (Adaptive Engine)                │
│                                                                    │
│   1. Read skill_scores from event payload                          │
│   2. For each skill_score < 0.60 → weakness_flags.create/update   │
│   3. For each new weakness → create remediation_plan               │
│   4. Map weak skills → remediation lessons via SkillTaxonomy       │
│   5. Set subsequent lessons in module to state = 'locked'          │
│   6. Emit remediation.updated event → Module 4                     │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│              Student sees remediation plan (Module 4)              │
│              Completes remedial lessons                            │
└───────────────────────────────┬────────────────────────────────────┘
                                │ POST /lessons/:id/complete (remedial)
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│           Module 6: all plan items completed?                      │
│           → Trigger focused retest via Module 5                    │
│           → Increment remediation_plans.retest_attempt_count       │
│           → If count = 3 and still failing → instructor_escalated  │
└───────────────────────────────┬────────────────────────────────────┘
                                │ New TestGraded event
                                ▼
                    ┌───────────────────────┐
                    │   Loop repeats        │
                    │   until mastered OR   │
                    │   escalated           │
                    └───────────────────────┘
```

---

## 2. TestGraded Event — Canonical Contract

### 2.1 Event Schema

```json
{
  "event_type": "test.graded",
  "version": "1.0",
  "emitted_at": "2026-09-10T16:00:00.123Z",
  "payload": {
    "submission_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "test_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "student_id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    "lesson_id": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    "lesson_version": 2,
    "attempt_number": 1,
    "overall_score": 0.6286,
    "skill_scores": [
      {
        "skill_id": "6ba7b813-9dad-11d1-80b4-00c04fd430c8",
        "skill_slug": "algebra.quadratic",
        "skill_name": "Quadratic Equations",
        "score": 0.4333,
        "max_score": 1.0,
        "grader_type": "llm"
      },
      {
        "skill_id": "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
        "skill_slug": "algebra.linear",
        "skill_name": "Linear Equations",
        "score": 0.9000,
        "max_score": 1.0,
        "grader_type": "deterministic"
      }
    ],
    "graded_at": "2026-09-10T16:00:00.000Z"
  }
}
```

### 2.2 Event Emission (Module 5)

```python
# services/event_emitter.py
import redis.asyncio as redis
import json
from datetime import datetime, timezone

redis_client = redis.from_url(settings.REDIS_URL)

async def emit_test_graded_event(
    submission: Submission,
    skill_scores_by_id: dict  # {skill_id: SkillScore}
) -> None:
    """
    Emit TestGraded event to Redis Streams.
    Called after all SkillScore rows are committed to DB.
    This is the ONLY place this event is emitted.
    """
    skill_score_payloads = []
    for skill_id, ss in skill_scores_by_id.items():
        skill = await get_skill(skill_id)
        skill_score_payloads.append({
            "skill_id": str(skill.id),
            "skill_slug": skill.slug,
            "skill_name": skill.name,
            "score": float(ss.score),
            "max_score": float(ss.max_score),
            "grader_type": ss.grader_type.value
        })

    event = {
        "event_type": "test.graded",
        "version": "1.0",
        "emitted_at": datetime.now(timezone.utc).isoformat(),
        "payload": {
            "submission_id": str(submission.id),
            "test_id": str(submission.test_id),
            "student_id": str(submission.student_id),
            "lesson_id": str(submission.test.lesson_id),
            "lesson_version": submission.test.lesson_version,
            "attempt_number": submission.attempt_number,
            "overall_score": float(submission.overall_score),
            "skill_scores": skill_score_payloads,
            "graded_at": submission.graded_at.isoformat()
        }
    }

    await redis_client.xadd(
        "elarion:events:test_graded",
        {"data": json.dumps(event)},
        maxlen=10000,  # Keep last 10k events
        approximate=True
    )
```

### 2.3 Event Consumer (Module 6)

```python
# workers/adaptive_consumer.py

CONSUMER_GROUP = "module6-adaptive"
CONSUMER_NAME = "adaptive-worker-1"
STREAM_KEY = "elarion:events:test_graded"

async def start_adaptive_consumer():
    """
    Redis Streams consumer group worker.
    Runs as a long-lived background process.
    """
    # Create consumer group if not exists
    try:
        await redis_client.xgroup_create(STREAM_KEY, CONSUMER_GROUP, id="0", mkstream=True)
    except redis.ResponseError:
        pass  # Group already exists

    while True:
        # Read new messages
        messages = await redis_client.xreadgroup(
            CONSUMER_GROUP,
            CONSUMER_NAME,
            {STREAM_KEY: ">"},
            count=10,
            block=5000  # Block for 5s waiting for new messages
        )

        for stream, entries in (messages or []):
            for entry_id, data in entries:
                try:
                    event = json.loads(data[b"data"])
                    await process_test_graded(event)
                    # Acknowledge: message will not be re-delivered
                    await redis_client.xack(STREAM_KEY, CONSUMER_GROUP, entry_id)
                except Exception as e:
                    logger.error(
                        "Failed to process TestGraded event",
                        entry_id=entry_id,
                        error=str(e)
                    )
                    # Do NOT ack — will be redelivered (at-least-once delivery)

async def process_test_graded(event: dict):
    """Idempotent handler for a single TestGraded event."""
    payload = event["payload"]
    student_id = UUID(payload["student_id"])

    async with get_db_session() as db:
        for skill_score in payload["skill_scores"]:
            skill_id = UUID(skill_score["skill_id"])
            score = skill_score["score"]
            submission_id = UUID(payload["submission_id"])

            await process_skill_score(
                db=db,
                student_id=student_id,
                skill_id=skill_id,
                score=score,
                submission_id=submission_id
            )

        await db.commit()

    # Notify Module 4 to update dashboard
    await emit_remediation_updated(student_id)
```

---

## 3. Weakness Detection Rules

### 3.1 Rule Definition

```python
# config/adaptive_rules.py

WEAKNESS_THRESHOLD = 0.60  # Skills below this score are flagged as weaknesses
# This is a platform constant. Admin-configurable in a future version.
```

### 3.2 Detection Logic

```python
# services/weakness_detector.py

async def process_skill_score(
    db: AsyncSession,
    student_id: UUID,
    skill_id: UUID,
    score: float,
    submission_id: UUID
) -> None:
    """
    Idempotent: safe to call multiple times for the same (student_id, skill_id).
    """
    if score < WEAKNESS_THRESHOLD:
        await create_or_update_weakness(db, student_id, skill_id, score, submission_id)
    else:
        await resolve_weakness_if_active(db, student_id, skill_id, submission_id)


async def create_or_update_weakness(
    db: AsyncSession,
    student_id: UUID,
    skill_id: UUID,
    score: float,
    submission_id: UUID
) -> WeaknessFlag:
    """
    Create a new weakness flag if one doesn't exist for this (student, skill).
    If one already exists (from a previous test), update the score.
    The UNIQUE constraint on (student_id, skill_id) ensures no duplicates.
    """
    existing = await db.execute(
        select(WeaknessFlag).where(
            WeaknessFlag.student_id == student_id,
            WeaknessFlag.skill_id == skill_id,
            WeaknessFlag.status == WeaknessStatus.active
        )
    )
    flag = existing.scalar_one_or_none()

    if flag:
        # Update score (student failed again)
        flag.score_at_flag = score
        flag.submission_id = submission_id  # Point to most recent triggering submission
    else:
        flag = WeaknessFlag(
            student_id=student_id,
            skill_id=skill_id,
            submission_id=submission_id,
            score_at_flag=score,
            threshold=WEAKNESS_THRESHOLD,
            status=WeaknessStatus.active
        )
        db.add(flag)
        await db.flush()

        # Create remediation plan for this new weakness
        await create_remediation_plan(db, student_id, flag)

    return flag


async def resolve_weakness_if_active(
    db: AsyncSession,
    student_id: UUID,
    skill_id: UUID,
    submission_id: UUID
) -> None:
    """
    If score >= threshold on retest, resolve the active weakness flag.
    """
    result = await db.execute(
        select(WeaknessFlag).where(
            WeaknessFlag.student_id == student_id,
            WeaknessFlag.skill_id == skill_id,
            WeaknessFlag.status == WeaknessStatus.active
        )
    )
    flag = result.scalar_one_or_none()

    if flag:
        flag.status = WeaknessStatus.resolved
        flag.resolution_submission_id = submission_id
        flag.resolved_at = datetime.utcnow()

        # Complete the associated remediation plan
        await complete_remediation_plan(db, flag.id)

        # Unlock subsequent lessons if no other active weaknesses
        await unlock_lessons_if_clear(db, student_id, flag.skill_id)
```

---

## 4. Remediation Plan Generator

```python
# services/remediation_planner.py

async def create_remediation_plan(
    db: AsyncSession,
    student_id: UUID,
    weakness_flag: WeaknessFlag
) -> RemediationPlan:
    """
    Builds an ordered list of remediation lessons for a specific weak skill.
    Lessons are selected from Module 2's content library tagged with the weak skill.
    """
    # Find lessons tagged with this skill, ordered by sequence
    result = await db.execute(
        select(Lesson)
        .join(LessonSkill, LessonSkill.lesson_id == Lesson.id)
        .where(
            LessonSkill.skill_id == weakness_flag.skill_id,
            Lesson.status == LessonStatus.published
        )
        .order_by(Lesson.sequence_order)
        .limit(5)  # Cap at 5 remediation items
    )
    remedial_lessons = result.scalars().all()

    if not remedial_lessons:
        logger.warning(
            "No remedial lessons found for skill",
            skill_id=weakness_flag.skill_id,
            student_id=student_id
        )
        # Still create the plan (it may be populated manually by instructor)

    plan = RemediationPlan(
        student_id=student_id,
        weakness_flag_id=weakness_flag.id,
        status=PlanStatus.active,
        retest_attempt_count=0
    )
    db.add(plan)
    await db.flush()

    for i, lesson in enumerate(remedial_lessons):
        item = RemediationPlanItem(
            plan_id=plan.id,
            lesson_id=lesson.id,
            sequence_order=i + 1,
            status=PlanItemStatus.pending
        )
        db.add(item)

    # Lock subsequent content in the module
    await lock_lessons_for_weakness(db, student_id, weakness_flag)

    return plan
```

---

## 5. LearningPathState Machine

### 5.1 State Definitions

| State | Meaning | Transition From |
|---|---|---|
| `unlocked` | Student can access this lesson | Default for new lessons; set when prerequisites met |
| `in_progress` | Student has started but not completed | `unlocked` + first progress event |
| `mastered` | Lesson completed AND all skill assessments passed | `in_progress` + completion + score ≥ threshold |
| `locked` | Access denied due to active weakness flag | `unlocked` when weakness detected in a prerequisite |

### 5.2 State Transitions

```
unlocked
    │
    ├──→ in_progress    (student first accesses lesson)
    │
    └──→ locked         (weakness detected in prerequisite skill)

in_progress
    │
    ├──→ mastered       (lesson completed + skill score ≥ 0.60)
    │
    └──→ locked         (weakness detected while lesson is in progress)

locked
    │
    └──→ unlocked       (all prerequisite weaknesses resolved)

mastered
    (terminal — no further transitions unless content is updated)
```

### 5.3 Locking Logic

```python
async def lock_lessons_for_weakness(
    db: AsyncSession,
    student_id: UUID,
    weakness_flag: WeaknessFlag
) -> None:
    """
    When a weakness is detected for skill X,
    lock all subsequent lessons in the same module that also require skill X.
    Does NOT lock the lesson the student just completed.
    """
    # Find all lessons tagged with this skill that come AFTER the current one
    weak_lesson = await get_lesson_from_submission(db, weakness_flag.submission_id)

    result = await db.execute(
        select(Lesson)
        .join(LessonSkill, LessonSkill.lesson_id == Lesson.id)
        .where(
            LessonSkill.skill_id == weakness_flag.skill_id,
            Lesson.module_id == weak_lesson.module_id,
            Lesson.sequence_order > weak_lesson.sequence_order
        )
    )
    lessons_to_lock = result.scalars().all()

    for lesson in lessons_to_lock:
        # Use INSERT ... ON CONFLICT DO UPDATE
        await db.execute(
            insert(LearningPathState)
            .values(
                student_id=student_id,
                lesson_id=lesson.id,
                state=PathState.locked,
                locked_reason=f"Weakness detected: {weakness_flag.skill_id}",
                updated_at=datetime.utcnow()
            )
            .on_conflict_do_update(
                index_elements=["student_id", "lesson_id"],
                set_={
                    "state": PathState.locked,
                    "locked_reason": f"Weakness detected: {weakness_flag.skill_id}",
                    "updated_at": datetime.utcnow()
                }
            )
        )


async def unlock_lessons_if_clear(
    db: AsyncSession,
    student_id: UUID,
    resolved_skill_id: UUID
) -> None:
    """
    After a weakness is resolved, check if any locked lessons can now be unlocked.
    A lesson can be unlocked only if there are no OTHER active weakness flags
    for skills required by that lesson.
    """
    # Get all lessons still locked for this student
    locked = await db.execute(
        select(LearningPathState)
        .where(
            LearningPathState.student_id == student_id,
            LearningPathState.state == PathState.locked
        )
    )

    for lps in locked.scalars().all():
        lesson_skill_ids = await get_lesson_skill_ids(db, lps.lesson_id)

        # Check if any skills required by this lesson are still weak
        active_flags = await db.execute(
            select(WeaknessFlag)
            .where(
                WeaknessFlag.student_id == student_id,
                WeaknessFlag.skill_id.in_(lesson_skill_ids),
                WeaknessFlag.status == WeaknessStatus.active
            )
        )

        if not active_flags.scalar_one_or_none():
            # All weaknesses for this lesson's skills are resolved — unlock
            lps.state = PathState.unlocked
            lps.locked_reason = None
            lps.updated_at = datetime.utcnow()
```

---

## 6. Focused Retest Logic

```python
# services/retest_orchestrator.py

MAX_RETEST_ATTEMPTS = 3

async def trigger_focused_retest(
    db: AsyncSession,
    plan: RemediationPlan
) -> None:
    """
    Called when all remediation plan items are completed.
    Requests a new assessment scoped to the weak skill only.
    """
    if plan.retest_attempt_count >= MAX_RETEST_ATTEMPTS:
        await escalate_to_instructor(db, plan)
        return

    # Increment attempt counter
    plan.retest_attempt_count += 1
    await db.commit()

    # Get the weakness flag and its skill
    weakness = await db.get(WeaknessFlag, plan.weakness_flag_id)

    # Call Module 5's generation service with skill scope filter
    # This generates a new focused test targeting ONLY the weak skill
    focused_test = await generate_focused_test(
        lesson_id=weakness.submission.test.lesson_id,
        skill_filter=[weakness.skill_id],
        db=db
    )

    # Notify Module 4 to present the retest to the student
    await emit_remediation_updated(plan.student_id, {
        "type": "retest_ready",
        "test_id": str(focused_test.id),
        "attempt_number": plan.retest_attempt_count,
        "max_attempts": MAX_RETEST_ATTEMPTS
    })


async def escalate_to_instructor(
    db: AsyncSession,
    plan: RemediationPlan
) -> None:
    """
    Called after MAX_RETEST_ATTEMPTS failed retests.
    Flags the student for human instructor intervention.
    No further auto-retests are triggered.
    """
    plan.instructor_escalated = True
    await db.commit()

    # Create a notification visible in the instructor's dashboard
    weakness = await db.get(WeaknessFlag, plan.weakness_flag_id)
    skill = await db.get(SkillTaxonomy, weakness.skill_id)

    db.add(Notification(
        student_id=plan.student_id,
        type="instructor_escalation",
        title="Your instructor has been notified",
        body=(
            f"You've reached the maximum attempts for the skill "
            f'"{skill.name}". Your instructor will be in touch to help you.'
        ),
        payload={"plan_id": str(plan.id), "skill_slug": skill.slug}
    ))

    await db.commit()

    logger.warning(
        "Student escalated to instructor",
        student_id=plan.student_id,
        skill_id=weakness.skill_id,
        attempts=plan.retest_attempt_count
    )
```

---

## 7. Events Emitted by Module 6

### `remediation.updated`

```json
{
  "event_type": "remediation.updated",
  "version": "1.0",
  "emitted_at": "2026-09-10T16:05:00Z",
  "payload": {
    "student_id": "uuid",
    "plan_id": "uuid",
    "update_type": "plan_created",
    "skill_slug": "algebra.quadratic",
    "locked_lesson_count": 3
  }
}
```

`update_type` values: `plan_created`, `plan_completed`, `retest_ready`, `escalated`

---

## 8. API Endpoint — Content Gating Enforcement

```python
# Module 4 / shared route dependency
# GET /api/v1/lessons/:id enforces this check

async def check_lesson_access(
    lesson_id: UUID,
    current_user: User,
    db: AsyncSession
) -> None:
    """
    FastAPI dependency injected into GET /lessons/:id.
    Raises 403 if lesson is locked for this student.
    Instructors and Admins bypass gating.
    """
    if current_user.has_role("Instructor") or current_user.has_role("Admin"):
        return  # Instructors can always preview locked content

    result = await db.execute(
        select(LearningPathState).where(
            LearningPathState.student_id == current_user.id,
            LearningPathState.lesson_id == lesson_id
        )
    )
    state = result.scalar_one_or_none()

    if state and state.state == PathState.locked:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "LESSON_LOCKED",
                "message": "This lesson is locked. Complete your remediation plan first.",
                "locked_reason": state.locked_reason
            }
        )
```

---

## 9. Observability — Tracing the Adaptive Loop

The complete end-to-end chain must be traceable with a single `trace_id`:

```
Student submits test (trace_id: abc123)
    │
    ├── M5: Grading pipeline span (trace_id: abc123)
    │       ├── MCQ grading (deterministic)
    │       ├── Short answer grading (LLM call, token count tracked)
    │       ├── SkillScore write to DB
    │       └── TestGraded event emit → Redis Streams
    │
    ├── M6: Event consumer span (trace_id: abc123, propagated via event headers)
    │       ├── Weakness detection
    │       ├── WeaknessFlag write
    │       ├── RemediationPlan write
    │       ├── LearningPathState lock
    │       └── remediation.updated event emit
    │
    └── M4: SSE push span
            └── Student notification delivered
```

**OpenTelemetry trace propagation in events:**

```python
# Include trace context in event payload for cross-service correlation
from opentelemetry import trace
from opentelemetry.propagate import inject

def build_event_with_trace(payload: dict) -> dict:
    carrier = {}
    inject(carrier)  # Injects traceparent, tracestate headers
    return {
        **payload,
        "_trace_context": carrier
    }
```

---

*For the full database schema supporting these entities, see `02-DATABASE-AND-ERD.md`.*
*For testing the adaptive loop with simulated events, see `06-TESTING-AND-DEVOPS-GUIDE.md §5`.*
