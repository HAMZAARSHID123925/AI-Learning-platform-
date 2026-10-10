# ELARION - one-time local setup. Run once:  powershell -ExecutionPolicy Bypass -File .\setup-local.ps1
$root = $PSScriptRoot
function Fail($msg) { Write-Host "`nFAILED: $msg" -ForegroundColor Red; Write-Host "Copy the error above and send it to Claude." -ForegroundColor Yellow; Read-Host "Press Enter to close"; exit 1 }
function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

Step "Checking tools"
foreach ($t in @("docker","python","node","npm")) { if (-not (Get-Command $t -ErrorAction SilentlyContinue)) { Fail "$t is not installed (or not on PATH)." } }
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { Write-Host "WARNING: ffmpeg not found. The website will work, but videos cannot be rendered until you install FFmpeg." -ForegroundColor Yellow }
docker info *> $null; if ($LASTEXITCODE -ne 0) { Fail "Docker Desktop is not running. Open Docker Desktop, wait for 'Engine running', then run this script again." }

Step "1/6 Starting databases (Postgres, Redis, MinIO)"
Set-Location "$root\backend"
docker compose up -d postgres redis minio; if ($LASTEXITCODE -ne 0) { Fail "docker compose" }
Write-Host "Waiting for Postgres to be ready..."
for ($i = 0; $i -lt 30; $i++) { $s = docker inspect -f "{{.State.Health.Status}}" elarion_postgres 2>$null; if ($s -eq "healthy") { break }; Start-Sleep 2 }
if ($s -ne "healthy") { Fail "Postgres did not become ready" }

Step "2/6 Installing backend Python packages (takes a few minutes)"
if (-not (Test-Path "venv")) { python -m venv venv; if ($LASTEXITCODE -ne 0) { Fail "creating venv" } }
$py = "$root\backend\venv\Scripts\python.exe"
& $py -m pip install --upgrade pip; & $py -m pip install -r requirements.txt; if ($LASTEXITCODE -ne 0) { Fail "pip install" }

Step "3/6 Creating database tables"
& $py -m alembic upgrade head; if ($LASTEXITCODE -ne 0) { Fail "alembic migrations" }

Step "4/6 Creating storage bucket and demo data"
& $py -m scripts.setup_storage; if ($LASTEXITCODE -ne 0) { Fail "setup_storage" }
& $py -m scripts.seed_data; if ($LASTEXITCODE -ne 0) { Fail "seed_data" }
& $py -m scripts.seed_courses; if ($LASTEXITCODE -ne 0) { Fail "seed_courses" }
& $py -m scripts.seed_demo_accounts; if ($LASTEXITCODE -ne 0) { Fail "seed_demo_accounts" }
& $py -m scripts.seed_video_demo; if ($LASTEXITCODE -ne 0) { Fail "seed_video_demo" }

Step "5/6 Installing video renderer"
Set-Location "$root\video-render"
npm ci; if ($LASTEXITCODE -ne 0) { Fail "npm ci in video-render" }

Step "6/6 Installing website (frontend)"
Set-Location "$root\frontend"
npm install; if ($LASTEXITCODE -ne 0) { Fail "npm install in frontend" }

Set-Location $root
Write-Host "`nSETUP COMPLETE. Now run:  powershell -ExecutionPolicy Bypass -File .\start-local.ps1" -ForegroundColor Green
Read-Host "Press Enter to close"
