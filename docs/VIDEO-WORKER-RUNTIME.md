# Personalized video worker runtime

The worker needs the backend source and the adjacent video-render directory. It does not need a frontend filesystem or a frontend development server. Database and Redis settings come from backend/.env resolved relative to backend source, with process environment taking precedence. Supply the same private database, broker and S3-compatible storage configuration to API and workers.

Install backend requirements and run npm ci in video-render using its lockfile. Provide Node, FFmpeg and ffprobe on the worker PATH or set VIDEO_NODE_BINARY, FFMPEG_BINARY and FFPROBE_BINARY in the worker environment or ignored backend/.env. Executable paths are deployment configuration, never committed user paths. Remotion launches the local tsx entry point directly with Node; npm and a shell are not used to render jobs.

The container sets REMOTION_CHROMIUM_EXECUTABLE_PATH. The renderer and smoke test pass this to Remotion as browserExecutable. Without it, Remotion provisions its supported Headless Shell. Provision and run the health test during worker/image preparation so the first paid job does not have to discover missing browser dependencies. Do not copy a developer browser cache as deployment configuration.

Non-paid smoke test, from video-render:

```
node node_modules/tsx/dist/cli.mjs src/runtime-health.ts
```

It bundles a local composition, launches Chromium, renders two seconds of H.264 and local generated audio, probes streams, decodes the output, and removes its unique temporary files. FFmpeg/ffprobe overrides must also be exported to the Node health-test process. Run it as the same OS user as the worker. Use the existing video worker Dockerfile as the deployment layout; a container build and runtime must still be tested on the target platform before production release.

Start the API, adaptive consumer and video consumer as separate supervised processes. Launch the worker with python -m app.workers.video_generation_consumer from backend, or with backend available on PYTHONPATH. Configure private storage access and reachable narration URLs from the renderer host. This architecture runs the renderer as a subprocess of the video worker; moving the renderer to its own service would require a remote execution adapter, not just a hostname change.

Durable states are queued, planning, scripting, storyboard_ready, assets_preparing, audio_generating, audio_ready, rendering, uploading, ready/failed. The saved storyboard, every uploaded narration clip, pending synthesized narration, generated asset manifest, and bounded MP4 checkpoint permit recovery without repeating completed paid work. MP4 checkpoints are limited to 64 MiB and cleared after confirmed private upload. Over-limit jobs fail deterministically; larger artifacts need a dedicated durable staging design.

A render uses unique temporary paths, a measured-duration budget bounded to 30 minutes, a renewable owned Redis lease, cancellation cleanup, ffprobe checks, and full audio/video decode validation. Validation runs off the asyncio event loop so lease renewal can continue. A verified storage PUT confirms size, MIME and SHA-256 metadata before READY. Upload failure retains the validated MP4 for retry.

FAILED requires explicit owned Retry. READY and terminal duplicate deliveries never regenerate. Active uniqueness is enforced by the database index from migration 017, row locks serialize requests for a weakness, Redis ownership protects workers, and the durable dispatch sweep recovers orphaned nonterminal rows. The focused tests inject process failure, timeout, missing runtime/audio, corruption, lost leases, queue duplication, restart and upload failure without paid calls or database reset. They do not constitute a distributed load test.

Renderer prerequisite failures use VIDEO_RENDER_ENV_FAILED; timeout uses VIDEO_RENDER_TIMEOUT; other render failures retain VIDEO_RENDER_FAILED and a sanitized cause. Upload errors remain VIDEO_UPLOAD_FAILED. Logs redact URLs and credentials before truncating stderr. Job context includes course, submission, worker, stage and attempt; new render manifests record render/upload elapsed seconds. Configure monitoring of failed jobs, lease renewal and queue latency in the deployment environment.
