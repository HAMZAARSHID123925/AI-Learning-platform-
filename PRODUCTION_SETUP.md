# ELARION Production Setup Guide

## 1. Required Runtime Components
To run ELARION in production, you need the following infrastructure components:
- **Backend API**: FastAPI application served via Uvicorn (multi-worker recommended).
- **Frontend App**: Next.js Node.js process (standalone recommended).
- **Adaptive Worker**: Lightweight Python process consuming Valkey/Redis events for curriculum personalization.
- **Video Worker**: Heavy Python process consuming Valkey/Redis events for personalized video generation.
- **External Dependencies**:
  - PostgreSQL DB (Neon recommended).
  - Redis/Valkey stream cache (Aiven recommended).
  - S3 Object Storage (AWS/Cloudflare/MinIO).
  - OpenAI / ElevenLabs APIs.

## 2. Docker Build Commands
You can build the exact production images locally for verification or in your CI pipeline:

```bash
# Backend Image (API)
docker build -t elarion-backend -f backend/Dockerfile backend/

# Frontend Image (Next.js)
docker build -t elarion-frontend -f frontend/Dockerfile frontend/

# Adaptive Worker Image
docker build -t elarion-adaptive -f backend/Dockerfile.adaptive_worker backend/

# Video Rendering Worker Image
docker build -t elarion-video -f backend/Dockerfile.video_worker .
```

## 3. Environment Setup
The containers expect configuration injected purely via environment variables at runtime. DO NOT bake secrets into the images.

**Core Environment Variables**:
- `DATABASE_URL` (Postgres connection string)
- `REDIS_URL` (Redis/Valkey connection string)
- `ENVIRONMENT=production`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `S3_REGION`
- `NEXT_PUBLIC_API_URL` (For frontend networking)
- `CORS_ORIGINS` (For backend networking)

## 4. Service Startup Commands
The images automatically execute the correct production process:

- **Backend API**: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`
- **Frontend Web**: `npm start`
- **Adaptive Worker**: `python -m app.workers.adaptive_consumer`
- **Video Worker**: `python -m app.workers.video_generation_consumer`

## 5. Migration Strategy
**DO NOT** automatically run Alembic migrations on API container startup (this causes race conditions across replicas).
Instead, run migrations as a **one-off Job** or manually during the release process:
```bash
docker run --rm -e DATABASE_URL=... elarion-backend python -m alembic upgrade head
```

## 6. Health Checks
- **Backend API**: `curl -f http://localhost:8000/health/live`
- **Frontend App**: standard HTTP `GET /` or `wget -qO- http://localhost:3000`
- **Workers**: Do not expose HTTP ports. Relies on Docker/Kubernetes container exit code restarts.

## 7. Remotion / FFmpeg Runtime Notes (Video Worker)
The Video Worker image is purposefully heavier. It bundles:
- `python:3.12-slim`
- `nodejs` 20.x
- `ffmpeg` and `ffprobe`
- `chromium` and system dependencies (for Remotion/Puppeteer headless rendering).

Because it runs headless Chromium inside Docker, it relies on the `REMOTION_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` environment mapping.
Additionally, temp directories are mapped to `/home/elarion/app/tmp` internally. No persistent volumes are required since the worker cleans up the rendering artifacts or restarts safely.

## 8. Verification Order
When deploying a new environment, verify in this order:
1. Provision Neon DB, Valkey, and S3.
2. Run database migration (`alembic upgrade head`).
3. Deploy Backend API and check `/health/live`.
4. Deploy Frontend and check Next.js renders.
5. Deploy Adaptive Worker (check logs for successful Redis stream connection).
6. Deploy Video Worker (check logs for Remotion binary/ffmpeg path resolutions).

## Collaborators using separate localhost frontends

`localhost` means each person's own computer. Git shares source code; it does not share courses, users, progress or video jobs. Two independent local databases will show independent records even when both users are Admin.

To test the same platform, run both frontends against one existing team backend. Set each frontend's local, untracked `.env.local` `NEXT_PUBLIC_API_URL` to that backend's reachable `/api/v1` URL and restart the frontend. The backend must allow the intended frontend origins in `CORS_ORIGINS`. Do not put a database password, Redis credential, signing secret or storage key in a `NEXT_PUBLIC_*` variable or Git. Confirm the actual host with your collaborator; another computer cannot reach your backend through your `localhost` URL.

If the team intentionally runs multiple backends, configure their local secrets for the same intended database, Redis namespace and private storage environment, with compatible signing configuration and coordinated workers. Do not merge independent databases or broaden course authorization to compensate for different environments.

Admin accounts in this single platform scope see all courses, including drafts. Instructor accounts remain limited to owned/assigned courses. Student accounts remain limited to published courses in their grade and the required enrollment/progress rules. There is currently no tenant/workspace model; separate organizations should not share this single platform database.

Apply migration `019_course_scoped_weakness` before running the updated adaptive/video workers. Failed personalized videos now have an explicit owned retry action; refreshing results or checking status does not restart paid generation. An actively leased video is never restarted by that action.