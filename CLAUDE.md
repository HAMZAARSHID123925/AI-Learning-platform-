# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ELARION / "Pen & Page Academia": an adaptive learning platform. Students take AI-generated assessments; weak skills trigger a remediation plan, lesson gating, and a personalized narrated video. Three deployable codebases live in one repo:

- `backend/` — FastAPI + async SQLAlchemy + PostgreSQL (pgvector) + Redis Streams. Also hosts the two worker processes.
- `frontend/` — Next.js 16 (App Router), React 19, Tailwind v4.
- `video-render/` — Remotion renderer, invoked as a Node subprocess by the backend video worker (not a service).

`frontend/AGENTS.md` (imported by `frontend/CLAUDE.md`) has the frontend design system and rules; read it before UI work. Parts of it are aspirational (localStorage gamification helpers "to build", stale file tree) — trust the code over it.

## Commands

### Backend (run from `backend/`)

```bash
docker compose up -d postgres postgres_test redis minio   # local infra (backend/docker-compose.yml)
pip install -r requirements.txt
python -m alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
python -m app.workers.adaptive_consumer            # separate process
python -m app.workers.video_generation_consumer    # separate process
ruff check app && mypy app
```

Config comes from `backend/.env` (copy `.env.example`); `DATABASE_URL` and `REDIS_URL` have no defaults, and RS256 keys are expected at `backend/keys/{private,public}.pem` (gitignored — generate them).

Tests need a real Postgres with pgvector and a real Redis; `tests/conftest.py` raises at import unless all three are set, and it **drops/recreates all tables** and **`FLUSHDB`s** the Redis it is pointed at:

```bash
ENVIRONMENT=test \
TEST_DATABASE_URL=postgresql+asyncpg://elarion_user:elarion_pass@localhost:5433/elarion_test \
TEST_REDIS_URL=redis://localhost:6379/15 \
pytest tests/unit/test_grading_engine.py::test_name
```

(PowerShell: set `$env:ENVIRONMENT = 'test'` etc. first.) `tests/unit`, `tests/integration`, `tests/certification` are the real suites. The many `test_*.py` / `check_*.py` / `patch_*.py` files at `backend/` root and the repo root are ad-hoc scripts, not part of the pytest run (`testpaths = tests`).

### Frontend (run from `frontend/`)

```bash
npm run dev            # next dev --webpack
npx tsc --noEmit       # type check (CI gate)
npm run build          # next build --webpack (CI gate)
npm run lint
node --test tests/product-contract.test.cjs    # contract tests; no npm script
```

`tests/*.test.cjs` use `node:test` with an inline TypeScript transpile hook that loads `src/utils/*.ts` directly and stubs `fetch`. Set `ELARION_BUILD_DIR` to build into a different dist dir while a dev server is running. API base is `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`).

### Video renderer (run from `video-render/`)

```bash
npm ci
node node_modules/tsx/dist/cli.mjs src/runtime-health.ts   # non-paid smoke test: bundles, launches Chromium, renders 2s, probes
npm run studio
```

`tests/product-contract.test.ts` is written against `node:test`, although the `test` script still points at jest (no jest config exists) — run it through tsx's test runner rather than `npm test`.

### CI

`.github/workflows/ci.yml` only runs `python -m compileall app` for the backend and `tsc --noEmit` + `npm run build` for the frontend. No test suite runs in CI.

## Architecture

### Backend layout

`app/main.py` is an application factory (`create_app()`); tests build a fresh app and override `get_db` / `get_redis`. Six domain modules under `app/modules/`, each with `models.py`, `schemas.py`, `router.py`, `services/`, all mounted under `/api/v1`:

| Module | Domain |
|---|---|
| `module1_auth` | users, RBAC roles/permissions, RS256 JWT, refresh tokens |
| `module2_content` | courses → modules → lessons, assets, embeddings outbox |
| `module3_live` | live sessions (provider strategy; `mock` by default) |
| `module4_experience` | enrollment, progress, dashboard, notifications, SSE |
| `module5_assessment` | test generation (RAG), grading, access rules |
| `module6_adaptive` | weakness flags, remediation plans, path gating, personalized video pipeline |

`app/shared/` holds cross-cutting pieces: `dependencies.py` (auth + `require_permission(...)` as FastAPI dependencies — RBAC is enforced at the route, not inside services), `exceptions.py` (domain exceptions mapped to HTTP status centrally in `main.py`; raise these rather than `HTTPException`), `ai_client.py` / `tts_client.py` / `s3_client.py` (provider-abstracted, selected by `LLM_PROVIDER`, `EMBEDDING_PROVIDER`, `TTS_PROVIDER`), and `redis_client.py`, which silently falls back to an in-process `MockRedisClient` outside production when Redis is unreachable.

Role scoping, with no tenant model: Admin sees all courses including drafts; Instructor only owned/assigned courses; Student only published courses in their grade, subject to enrollment and gating.

### The adaptive loop (spans modules 5 → 6 and two workers)

1. Grading (`module5_assessment/services/grading_service.py`) writes a `TestGradedOutbox` row in the same transaction as the grade; `shared/events.py` publishes it to the Redis stream `{REDIS_KEY_PREFIX}:events:test_graded` with a Lua dedup key per submission.
2. `workers/adaptive_consumer.py` (consumer group `module6-adaptive`) compares skill scores against `WEAKNESS_THRESHOLD`, creates/resolves `WeaknessFlag`s, generates a written remedial course via the LLM, and locks/unlocks downstream lessons (`path_gating_service.py`).
3. `module6_adaptive/services/video_job_service.py` creates a `VideoGenerationJob` and enqueues to `{prefix}:video_generation:jobs`.
4. `workers/video_generation_consumer.py` (group `video-generation-group`) drives the job through durable states: `queued → planning → scripting → storyboard_ready → assets_preparing → audio_generating → audio_ready → rendering → uploading → ready | failed`.

Invariants that the video pipeline code is built around — preserve them when editing:

- Every stage persists its output (storyboard, per-scene narration, asset manifest, bounded MP4 checkpoint) so a restart resumes without repeating paid LLM/TTS calls.
- Ownership is a renewable Redis lease per job (`...:video_generation:lease:{job_id}`); losing the lease cancels the render. No DB transaction is held during rendering.
- One live job per weakness is enforced by a partial unique index (migration 017) plus row locks.
- `ready` and duplicate deliveries never regenerate. `failed` only restarts via the explicit owner-initiated retry action — status polling or page refresh must never restart generation.
- Both consumers use `XAUTOCLAIM` to recover messages from dead workers, so handlers must be idempotent.

`docs/VIDEO-WORKER-RUNTIME.md` is the authoritative description of this runtime; `docs/SAAS-VIDEO-RECOVERY-REPORT.md` covers the recovery design.

### Backend ↔ renderer contract

`module6_adaptive/services/render_service.py` builds a JSON payload and launches `video-render/node_modules/tsx/dist/cli.mjs src/render.ts` directly with Node (resolved relative to the repo root — no npm, no shell). Node/FFmpeg/ffprobe come from `PATH` or `VIDEO_NODE_BINARY` / `FFMPEG_BINARY` / `FFPROBE_BINARY`. The payload shape is defined twice and must stay in sync: Python side in `module6_adaptive/services/storyboard_schema.py` and `module6_adaptive/visual/`, TypeScript side in `video-render/src/types.ts` and `validate_payload.ts`. Output is validated with ffprobe plus a full decode before upload. The video worker Docker image is therefore built from the repo root (`-f backend/Dockerfile.video_worker .`), unlike the other images.

### Video template renderer (video-render/src/templates/)

The renderer draws each video in two layers. `templates/theme.ts` holds everything that is identical in every video (colours, header, card layout, subtitle bar, teacher position, animation timing). `templates/LessonScene.tsx` draws one scene as a pure function of `(scene, frame)`; `templates/timeline.ts` derives from the same constants exactly which frames change (enter/exit, reveals, subtitle cuts). `render.ts` in `template` mode (default; `VIDEO_RENDER_MODE=full` restores the old every-frame `renderMedia` path) renders only those keyframes with `renderFrames`, expands them into a frame-exact image sequence via hard links, overlays the teacher (`templates/Teacher.tsx`, a seamless loop rendered once and cached under the OS temp dir as `loop.mov`) and muxes the narration with FFmpeg (`FFMPEG_BINARY`, passed by `render_service.py`). Keep the stage free of per-frame motion: anything that animates continuously belongs in the teacher layer, otherwise it must be declared in `sceneActiveRanges()` or it will be frozen. The teacher layer is real footage when `video-render/assets/teacher_{talking,idle,point}.mp4` exist (green-screen clips generated in Google Flow; `templates/teacherClip.ts` holds crop, key colour, placement and which clip is mirrored): each clip is keyed once into cached colour + alpha-matte videos, then `speechIntervals()` (FFmpeg silencedetect on each narration file) and `planTeacher()` decide per moment whether she talks or stands idle — one continuous talking take per scene from the first word to the last, idle in the silence after it (set `VIDEO_TEACHER_PAUSE_SECONDS`, e.g. 1.5, to also go idle during long mid-scene pauses) — and the segments are cut from the cached clips as per-segment `-ss/-t` inputs joined with 0.25 s `xfade` crossfades (colour and matte chains built identically, then `alphamerge`). The pointing clip is cached but not currently sequenced (a silent gesture during speech broke the sync). The header shows the school logo from `video-render/public/logo.png` via `staticFile`; `public/` is part of the bundle hash. Without the clips the drawn `templates/Teacher.tsx` loop is used. `VIDEO_OUTPUT_HEIGHT` (720 by default in `.env`) scales the output; the composition canvas stays 1920x1080.

### Migrations

`backend/alembic/versions/` is a single linear chain despite the mixed naming: `001…014` → `015_…` → seven hash-named revisions (`6afbb004bacb` … `15fc1715d468`) → `016_…` → `020_video_upload_checkpoint` (current head). Revision IDs for 015+ are the full slug, not the number. New model modules must also be imported in `alembic/env.py` and in `tests/conftest.py::init_test_db` (tests use `Base.metadata.create_all`, not Alembic). Embedding columns are `vector(384)` to match `EMBEDDING_DIM`; changing the embedding model needs a migration and re-embed. Do not run migrations on API container startup — run them as a one-off step.

### Frontend layout

Route groups in `src/app/`: `(auth)`, `(main)` (public), `(dashboard)` with `dashboard/` (student), `instructor/`, `admin/`. `src/app/api/*` are thin Next route handlers, mostly proxying to FastAPI.

Backend access goes through `src/lib/api.ts::fetchWithAuth`, which attaches the bearer token from `lib/auth-storage.ts` and performs a single-flight refresh via the HttpOnly refresh cookie on 401. Domain clients sit on top of it in `src/utils/` (`learningApi.ts`, `adminApi.ts`, `personalizedVideo.ts`, `courseCreation.ts`); pages reach them through the contexts in `src/contexts/`. The contract tests pin behaviours worth knowing: an empty or denied backend response must surface as empty/unavailable and never fall back to seeded demo data (`src/data/`), and course creation is checkpointed so a retry resumes without recreating the course or re-uploading finished media.

## Rules and gotchas

- Keep `--webpack` on the Next `dev`/`build` scripts; Turbopack crashes with Tailwind v4's PostCSS plugin.
- This is Next.js 16 with breaking changes versus older versions — consult `frontend/node_modules/next/dist/docs/` before using Next APIs. `useSearchParams()` must sit inside a `<Suspense>` boundary or the build fails.
- Frontend conventions: pill buttons (`rounded-full`), `rounded-2xl` cards, mobile-first, no dark mode, four tracks only (CS, Math, English, Physics), max six courses on the public catalog grid.
- The README asks for Discuss → Approve → Build: propose a plan before implementing non-trivial changes, and treat `backend/` as a separately owned area when the task is frontend work.
- Env-var name mismatch: the backend reads `CORS_ALLOWED_ORIGINS`, but `docker-compose.prod.yml` and `PRODUCTION_SETUP.md` set `CORS_ORIGINS`. The compose default origin is `:3000` while the docs quote the frontend at `:3001`.
- `frontend/learning/` is a committed Python virtualenv and `backend/uploads/` holds committed media; neither is source — exclude them from searches and edits.
- `docs/` is the current documentation set; `docx/` holds legacy SDD specs.

### Presenters (male / female teacher)
- `script_generation_service` picks `scene_json["teacher"]` at random per job from `TEACHER_PRESENTERS` (config, default `female,male`); a retried job keeps its choice.
- Voice: `Settings.tts_voice_for(teacher)` -> `OPENAI_TTS_VOICE_MALE` (default onyx) / `OPENAI_TTS_VOICE_FEMALE` (default = `OPENAI_TTS_VOICE`); ElevenLabs equivalents `ELEVENLABS_VOICE_ID_{MALE,FEMALE}`. `audio_generation_service` passes `voice=` to `synthesize_narration`; the clip cache key already includes the voice.
- Render payload carries `"teacher"`; `video-render/src/templates/teacherClip.ts` has `TEACHER_PRESENTERS` (female: `teacher_*.mp4`, male: `teacher_m_*.mp4` in `video-render/assets/`), each with its own crop/key/place. Missing male clips -> renderer logs `render_warning` and uses the female set.
- Set `TEACHER_PRESENTERS=female` to disable the male teacher.
