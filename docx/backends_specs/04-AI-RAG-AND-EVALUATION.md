# 04 — AI, RAG & EVALUATION ENGINE
## ELARION Platform — Claude API Integration, Embedding Pipeline, Assessment Generation & Grading

> **Document Type:** AI Engineering Specification
> **Covers:** Embedding pipeline, pgvector RAG retrieval, Claude API prompts, assessment generation, multi-agent grading, cost & error management

---

## 1. AI Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Content Pipeline (Module 2)                  │
│                                                                 │
│  Published Lesson                                               │
│       ↓                                                         │
│  Text / PDF Extraction                                          │
│       ↓                                                         │
│  Semantic Chunking (512 tokens, 50-token overlap)               │
│       ↓                                                         │
│  Embedding API Call (one call per chunk)                        │
│       ↓                                                         │
│  pgvector (content_embeddings table)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Top-k similarity search
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Assessment Engine (Module 5)                   │
│                                                                 │
│  RAG Retrieval (lesson_id + skill_id filters)                   │
│       ↓                                                         │
│  Skill Context from SkillTaxonomy                               │
│       ↓                                                         │
│  Claude API: Test Generation (async background job)             │
│       ↓                                                         │
│  Structured JSON Output: Questions + Options + Rubrics          │
│       ↓                                                         │
│  Stored in tests + questions tables                             │
│                                                                 │
│  Student Submits Answers                                        │
│       ↓                                                         │
│  MCQ → Deterministic Grader (no LLM)                           │
│  Short Answer → Claude API Grader                               │
│       ↓                                                         │
│  SkillScore per question aggregated to per-skill score          │
│       ↓                                                         │
│  TestGraded event emitted                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Embedding Pipeline (Module 2)

### 2.1 Trigger

The embedding pipeline is triggered via the **Outbox pattern** — not by a direct function call from the publish endpoint.

```python
# Inside the publish_lesson service (Module 2)
# This entire block runs in a single database transaction:

async def publish_lesson(lesson_id: UUID, db: AsyncSession) -> Lesson:
    lesson = await db.get(Lesson, lesson_id)
    if lesson.status != LessonStatus.draft:
        raise BusinessRuleError("Only draft lessons can be published")

    lesson.status = LessonStatus.published
    lesson.published_at = datetime.utcnow()
    lesson.content_version += 1

    # Outbox: write in same transaction — if publish fails, outbox row is never committed
    outbox_entry = EmbeddingOutbox(
        lesson_id=lesson.id,
        lesson_version=lesson.content_version,
        status=OutboxStatus.pending,
    )
    db.add(outbox_entry)

    await db.commit()
    return lesson
```

### 2.2 Async Worker

A background worker polls `embedding_outbox` for `status = 'pending'` rows:

```python
# workers/embedding_worker.py

async def process_embedding_outbox():
    """
    Runs as a continuous loop via APScheduler or Celery beat.
    Processes one outbox row at a time (or in small batches).
    """
    async with get_db_session() as db:
        # Claim a row atomically to prevent concurrent workers from double-processing
        row = await db.execute(
            update(EmbeddingOutbox)
            .where(
                EmbeddingOutbox.status == OutboxStatus.pending,
                EmbeddingOutbox.retry_count < 5
            )
            .values(status=OutboxStatus.processing)
            .returning(EmbeddingOutbox)
            .limit(1)
        )
        outbox = row.scalar_one_or_none()
        if not outbox:
            return  # Nothing to process

        try:
            # Verify lesson is still published (guard against race conditions)
            lesson = await db.get(Lesson, outbox.lesson_id)
            if lesson.status != LessonStatus.published:
                outbox.status = OutboxStatus.failed
                outbox.error_message = "Lesson is not published — skipping embedding"
                await db.commit()
                return

            # Idempotency check: skip if already embedded for this version
            existing = await db.execute(
                select(ContentEmbedding)
                .where(
                    ContentEmbedding.lesson_id == outbox.lesson_id,
                    ContentEmbedding.lesson_version == outbox.lesson_version
                )
                .limit(1)
            )
            if existing.scalar_one_or_none():
                outbox.status = OutboxStatus.completed
                outbox.processed_at = datetime.utcnow()
                await db.commit()
                return

            # Extract text from lesson content assets
            chunks = await extract_and_chunk_lesson(lesson)

            # Generate embeddings and store
            for i, chunk in enumerate(chunks):
                vector = await get_embedding(chunk.text)
                db.add(ContentEmbedding(
                    lesson_id=lesson.id,
                    lesson_version=outbox.lesson_version,
                    chunk_index=i,
                    chunk_text=chunk.text,
                    vector=vector,
                    skill_tags=chunk.skill_ids,
                ))

            outbox.status = OutboxStatus.completed
            outbox.processed_at = datetime.utcnow()
            await db.commit()

        except Exception as e:
            outbox.status = OutboxStatus.pending  # Allow retry
            outbox.retry_count += 1
            outbox.error_message = str(e)
            await db.commit()
            logger.error("Embedding job failed", lesson_id=outbox.lesson_id, error=str(e))
```

### 2.3 Text Extraction

```python
# services/content_extractor.py

async def extract_and_chunk_lesson(lesson: Lesson) -> list[TextChunk]:
    chunks = []
    for asset in lesson.content_assets:
        if asset.type == AssetType.text:
            text = asset.raw_text  # Stored as plain text
        elif asset.type == AssetType.pdf:
            text = await extract_pdf_text(asset.storage_key)  # Uses pdfplumber or pymupdf
        elif asset.type == AssetType.video:
            # Transcripts must be uploaded separately as text assets
            # Video files are not directly extracted — too expensive
            continue

        # Semantic chunking: ~512 tokens per chunk, 50-token overlap
        raw_chunks = chunk_text(text, max_tokens=512, overlap=50)
        for chunk_text_content in raw_chunks:
            chunks.append(TextChunk(
                text=chunk_text_content,
                skill_ids=[s.skill_id for s in lesson.lesson_skills]
            ))

    return chunks
```

### 2.4 Embedding API

```python
# services/embedding_service.py
import anthropic

# Note: Claude does not have a native embedding endpoint as of this spec.
# Use a dedicated embedding model: OpenAI text-embedding-3-small (1536 dims)
# or a self-hosted model (e.g. sentence-transformers via FastEmbed)
# The embedding model choice is a deployment decision — the schema uses vector(1536)
# but can be changed to vector(3072) for larger models.

import openai

async def get_embedding(text: str) -> list[float]:
    response = await openai.AsyncOpenAI().embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding
```

> **Note:** The embedding model (OpenAI, FastEmbed, Cohere, etc.) is separate from the LLM (Claude). Claude API is used for **generation and evaluation**, not embeddings. The `vector(1536)` dimension in the schema matches `text-embedding-3-small`. If you switch models, update the schema dimension and regenerate all embeddings.

---

## 3. RAG Retrieval (Module 5)

### 3.1 Retrieval Query

```python
# services/rag_service.py

async def retrieve_context(
    lesson_id: UUID,
    skill_ids: list[UUID],
    query: str,
    top_k: int = 8,
    db: AsyncSession = None
) -> list[RetrievedChunk]:
    """
    Perform semantic search over content_embeddings filtered by lesson and skills.
    Returns top-k chunks ordered by cosine similarity.
    """
    query_vector = await get_embedding(query)

    # pgvector cosine similarity search
    # Filter to only chunks from this lesson tagged with the target skills
    result = await db.execute(
        text("""
            SELECT
                id,
                lesson_id,
                lesson_version,
                chunk_index,
                chunk_text,
                skill_tags,
                1 - (vector <=> :query_vector) AS similarity
            FROM content_embeddings
            WHERE lesson_id = :lesson_id
              AND (:skill_ids = '{}' OR skill_tags && :skill_ids::uuid[])
              AND lesson_version = (
                  SELECT MAX(lesson_version)
                  FROM content_embeddings
                  WHERE lesson_id = :lesson_id
              )
            ORDER BY vector <=> :query_vector
            LIMIT :top_k
        """),
        {
            "query_vector": str(query_vector),
            "lesson_id": str(lesson_id),
            "skill_ids": "{" + ",".join(str(s) for s in skill_ids) + "}",
            "top_k": top_k
        }
    )

    rows = result.fetchall()
    return [RetrievedChunk(
        id=row.id,
        chunk_text=row.chunk_text,
        similarity=row.similarity,
        chunk_index=row.chunk_index
    ) for row in rows]
```

---

## 4. Assessment Generation — Claude API Prompt

### 4.1 System Prompt (Test Generator)

```python
ASSESSMENT_GENERATION_SYSTEM_PROMPT = """
You are an expert educational assessment designer with deep expertise in pedagogy,
cognitive assessment theory, and curriculum alignment.

Your task is to generate a rigorous, pedagogically sound assessment based on:
1. The provided learning content chunks (source material)
2. The specified skill taxonomy target

GENERATION RULES:
- Generate EXACTLY the number of questions specified in the request
- Every question must be directly answerable from the provided content chunks
- Do NOT introduce information not present in the source material
- MCQ distractors must be plausible, non-trivial, and based on common misconceptions
- Short answer rubrics must assess conceptual understanding, not keyword matching
- Each question must be tagged with the specific skill_id it tests
- Source chunk IDs must be recorded for every question for auditability

OUTPUT FORMAT:
Respond with valid JSON only. No markdown, no prose, no explanation outside the JSON.
Adhere strictly to the schema provided in the user message.
"""
```

### 4.2 User Prompt Template

```python
def build_generation_prompt(
    skill: SkillTaxonomy,
    chunks: list[RetrievedChunk],
    mcq_count: int = 5,
    short_answer_count: int = 2
) -> str:
    chunks_formatted = "\n\n".join([
        f"[CHUNK {i+1} | ID: {chunk.id}]\n{chunk.chunk_text}"
        for i, chunk in enumerate(chunks)
    ])

    return f"""
SKILL TARGET:
Name: {skill.name}
Slug: {skill.slug}
Description: {skill.description}
Skill ID: {skill.id}

SOURCE CONTENT CHUNKS:
{chunks_formatted}

TASK:
Generate {mcq_count} multiple-choice questions and {short_answer_count} short-answer questions
that assess student mastery of the skill: "{skill.name}"

OUTPUT JSON SCHEMA:
{{
  "questions": [
    {{
      "type": "mcq",
      "skill_id": "{skill.id}",
      "prompt": "<question text>",
      "source_chunk_ids": ["<chunk_id_1>", "<chunk_id_2>"],
      "options": [
        {{"id": "opt_a", "text": "<option text>", "is_correct": true}},
        {{"id": "opt_b", "text": "<option text>", "is_correct": false}},
        {{"id": "opt_c", "text": "<option text>", "is_correct": false}},
        {{"id": "opt_d", "text": "<option text>", "is_correct": false}}
      ],
      "rubric": null
    }},
    {{
      "type": "short_answer",
      "skill_id": "{skill.id}",
      "prompt": "<question text>",
      "source_chunk_ids": ["<chunk_id_1>"],
      "options": null,
      "rubric": {{
        "criteria": [
          {{"description": "<what student must demonstrate>", "weight": 0.6}},
          {{"description": "<secondary criterion>", "weight": 0.4}}
        ],
        "max_score": 1.0,
        "passing_threshold": 0.6
      }}
    }}
  ]
}}
"""
```

### 4.3 Generation API Call

```python
# services/assessment_generator.py
import anthropic

client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

async def generate_assessment(
    lesson_id: UUID,
    skill: SkillTaxonomy,
    db: AsyncSession
) -> Test:
    # Step 1: Retrieve relevant content chunks
    chunks = await retrieve_context(
        lesson_id=lesson_id,
        skill_ids=[skill.id],
        query=f"Key concepts and examples of {skill.name}",
        top_k=8,
        db=db
    )

    if not chunks:
        raise AssessmentGenerationError(
            f"No embedded content found for lesson {lesson_id} and skill {skill.slug}"
        )

    # Step 2: Call Claude API
    message = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        system=ASSESSMENT_GENERATION_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": build_generation_prompt(skill, chunks)
        }],
        # Force JSON output using Claude's structured output
        temperature=0.3,  # Lower temperature for more reliable structured output
    )

    # Step 3: Parse and validate response
    raw_json = message.content[0].text
    try:
        parsed = AssessmentGenerationResponse.model_validate_json(raw_json)
    except ValidationError as e:
        raise AssessmentGenerationError(f"Claude returned invalid JSON: {e}")

    # Step 4: Get current lesson version for traceability
    lesson = await db.get(Lesson, lesson_id)

    # Step 5: Persist test and questions
    test = Test(
        lesson_id=lesson_id,
        lesson_version=lesson.content_version,
        status=TestStatus.ready,
        generated_at=datetime.utcnow()
    )
    db.add(test)
    await db.flush()

    for i, q in enumerate(parsed.questions):
        question = Question(
            test_id=test.id,
            skill_id=UUID(q.skill_id),
            type=QuestionType(q.type),
            prompt=q.prompt,
            options=q.options,
            rubric=q.rubric,
            source_chunk_ids=[UUID(cid) for cid in q.source_chunk_ids],
            sequence_order=i + 1
        )
        db.add(question)

    await db.commit()
    return test
```

---

## 5. Grading Engine (Module 5)

### 5.1 MCQ Grading — Deterministic

```python
# services/grading/mcq_grader.py

def grade_mcq(question: Question, student_answer: str) -> GradeResult:
    """
    100% deterministic. Zero LLM calls.
    student_answer: the option_id the student selected (e.g. "opt_a")
    """
    correct_option = next(
        (opt for opt in question.options if opt["is_correct"]),
        None
    )

    if not correct_option:
        raise GradingError(f"Question {question.id} has no correct option defined")

    is_correct = student_answer == correct_option["id"]

    return GradeResult(
        question_id=question.id,
        skill_id=question.skill_id,
        score=1.0 if is_correct else 0.0,
        max_score=1.0,
        grader_type=GraderType.deterministic,
        feedback=None,  # No feedback for MCQ — answer is right or wrong
        llm_reasoning=None
    )
```

### 5.2 Short Answer Grading — LLM-as-a-Grader

```python
SHORT_ANSWER_GRADING_SYSTEM_PROMPT = """
You are an expert educational assessor evaluating student answers for conceptual accuracy.

Your evaluation must be:
- Based ONLY on the provided rubric criteria and source content
- Focused on conceptual understanding, NOT surface-level keyword matching
- Consistent: the same answer should always receive the same score
- Transparent: your reasoning must be traceable to specific rubric criteria

SCORING RULES:
- Score each rubric criterion independently (0.0 to criterion weight)
- Sum criterion scores for the total score (0.0 to 1.0)
- Do NOT penalise for spelling/grammar unless explicitly in rubric
- Do NOT award partial credit for incorrect conceptual understanding

OUTPUT FORMAT:
Respond with valid JSON only. No prose outside the JSON structure.
"""

def build_grading_prompt(
    question: Question,
    student_answer: str,
    source_chunks: list[str]
) -> str:
    source_text = "\n\n".join(source_chunks)
    criteria_text = "\n".join([
        f"- Criterion {i+1} (weight: {c['weight']}): {c['description']}"
        for i, c in enumerate(question.rubric["criteria"])
    ])

    return f"""
QUESTION:
{question.prompt}

RUBRIC CRITERIA:
{criteria_text}
Total max score: {question.rubric["max_score"]}

SOURCE CONTENT (authoritative reference material):
{source_text}

STUDENT ANSWER:
{student_answer}

TASK:
Evaluate the student's answer against each rubric criterion.
The evaluation must reference the source content.

OUTPUT JSON SCHEMA:
{{
  "criterion_scores": [
    {{
      "criterion_index": 0,
      "awarded_score": <float 0.0 to criterion weight>,
      "reasoning": "<specific explanation referencing rubric and source content>"
    }}
  ],
  "total_score": <float 0.0 to {question.rubric["max_score"]}>,
  "student_feedback": "<constructive feedback shown to the student — helpful, not discouraging>",
  "internal_reasoning": "<detailed evaluator notes — NOT shown to student>"
}}
"""

async def grade_short_answer(
    question: Question,
    student_answer: str,
    db: AsyncSession
) -> GradeResult:
    # Fetch source chunks for context
    chunk_ids = question.source_chunk_ids
    chunks = await db.execute(
        select(ContentEmbedding.chunk_text)
        .where(ContentEmbedding.id.in_(chunk_ids))
    )
    source_texts = [row[0] for row in chunks.fetchall()]

    message = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=SHORT_ANSWER_GRADING_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": build_grading_prompt(question, student_answer, source_texts)
        }],
        temperature=0.1,  # Very low — grading must be consistent
    )

    raw_json = message.content[0].text
    result = GradingResponse.model_validate_json(raw_json)

    return GradeResult(
        question_id=question.id,
        skill_id=question.skill_id,
        score=result.total_score,
        max_score=question.rubric["max_score"],
        grader_type=GraderType.llm,
        feedback=result.student_feedback,
        llm_reasoning=result.internal_reasoning
    )
```

### 5.3 Skill Score Aggregation

```python
# services/grading/score_aggregator.py

def aggregate_skill_scores(grade_results: list[GradeResult]) -> dict[UUID, float]:
    """
    Average all question scores for the same skill_id.
    Returns {skill_id: normalized_score (0.0 to 1.0)}
    """
    skill_scores: dict[UUID, list[float]] = {}
    for result in grade_results:
        if result.skill_id not in skill_scores:
            skill_scores[result.skill_id] = []
        skill_scores[result.skill_id].append(result.score / result.max_score)

    return {
        skill_id: sum(scores) / len(scores)
        for skill_id, scores in skill_scores.items()
    }
```

---

## 6. Full Grading Pipeline

```python
# services/grading/pipeline.py

async def run_grading_pipeline(submission_id: UUID, db: AsyncSession):
    """
    Orchestrates the full grading pipeline for a submission.
    Called asynchronously — never in a synchronous request path.
    """
    submission = await db.get(Submission, submission_id)
    submission.status = SubmissionStatus.grading
    await db.commit()

    try:
        test = await db.get(Test, submission.test_id)
        questions = await db.execute(
            select(Question).where(Question.test_id == test.id)
        )
        questions = questions.scalars().all()

        answers_map = {
            UUID(a["question_id"]): a["value"]
            for a in submission.answers
        }

        grade_results = []

        for question in questions:
            student_answer = answers_map.get(question.id)
            if student_answer is None:
                # No answer provided — score 0
                grade_results.append(GradeResult(
                    question_id=question.id,
                    skill_id=question.skill_id,
                    score=0.0,
                    max_score=1.0,
                    grader_type=GraderType.deterministic,
                    feedback="No answer provided.",
                    llm_reasoning=None
                ))
                continue

            if question.type == QuestionType.mcq:
                result = grade_mcq(question, student_answer)
            else:
                result = await grade_short_answer(question, student_answer, db)

            grade_results.append(result)

        # Aggregate to skill-level scores
        skill_averages = aggregate_skill_scores(grade_results)

        # Persist individual skill scores
        for result in grade_results:
            db.add(SkillScore(
                submission_id=submission.id,
                skill_id=result.skill_id,
                score=result.score,
                max_score=result.max_score,
                grader_type=result.grader_type,
                feedback=result.feedback,
                llm_reasoning=result.llm_reasoning
            ))

        # Update submission
        overall = sum(skill_averages.values()) / len(skill_averages) if skill_averages else 0.0
        submission.overall_score = overall
        submission.status = SubmissionStatus.graded
        submission.graded_at = datetime.utcnow()
        await db.commit()

        # Emit TestGraded event
        await emit_test_graded_event(submission, skill_averages)

    except Exception as e:
        submission.status = SubmissionStatus.submitted  # Allow retry
        await db.commit()
        logger.error("Grading pipeline failed", submission_id=submission_id, error=str(e))
        raise
```

---

## 7. Error Handling & Retry Strategy

| Error Type | Strategy | Max Retries |
|---|---|---|
| Claude API rate limit (429) | Exponential backoff: 1s, 2s, 4s, 8s | 4 |
| Claude API server error (5xx) | Exponential backoff | 3 |
| Claude invalid JSON output | Re-prompt once with explicit correction instruction | 1 |
| Embedding API error | Retry with backoff; fail outbox row after 5 attempts | 5 |
| Missing content chunks | Fail generation with logged error; alert admin | 0 |

```python
# Exponential backoff decorator for Claude calls
import asyncio
from functools import wraps

def with_retry(max_retries=3, base_delay=1.0, retryable_errors=(anthropic.RateLimitError, anthropic.APIStatusError)):
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_retries + 1):
                try:
                    return await fn(*args, **kwargs)
                except retryable_errors as e:
                    if attempt == max_retries:
                        raise
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Claude API error on attempt {attempt+1}, retrying in {delay}s: {e}")
                    await asyncio.sleep(delay)
        return wrapper
    return decorator
```

---

## 8. Claude Model Selection Guide

| Use Case | Recommended Model | Why |
|---|---|---|
| Assessment generation (complex) | `claude-opus-4-5` | Best reasoning for nuanced question design |
| Short answer grading | `claude-opus-4-5` | Rubric adherence requires strong instruction following |
| Remediation plan generation | `claude-sonnet-4-5` | Good enough; lower cost for simpler task |
| Simple feedback generation | `claude-haiku-3-5` | Fastest and cheapest for high-volume feedback |

---

## 9. Cost Management

| Operation | Model | Avg Input Tokens | Avg Output Tokens | Cost per Operation* |
|---|---|---|---|---|
| Generate 7-question test | claude-opus-4-5 | ~3,000 | ~1,500 | ~$0.05 |
| Grade 1 short answer | claude-opus-4-5 | ~800 | ~300 | ~$0.01 |
| Grade full 7-question test | Mixed | ~5,600 | ~600 | ~$0.04 |
| Remediation plan | claude-sonnet-4-5 | ~1,500 | ~800 | ~$0.01 |

*Approximate based on current Claude API pricing. Monitor with OpenTelemetry token counter.

**Cost controls:**
- Cache generated tests per `(lesson_id, lesson_version)` — only regenerate on new content version
- MCQ grading uses zero tokens
- Route simple operations to Haiku where reasoning is not required

---

*For the adaptive loop that consumes `TestGraded` events, see `05-ADAPTIVE-LOOP-AND-EVENTS.md`.*
*For testing the AI pipeline with mocked Claude responses, see `06-TESTING-AND-DEVOPS-GUIDE.md §4`.*
