# ELARION - start everything. Run each time:  powershell -ExecutionPolicy Bypass -File .\start-local.ps1
$root = $PSScriptRoot
docker info *> $null
if ($LASTEXITCODE -ne 0) { Write-Host "Docker Desktop is not running. Open it, wait for 'Engine running', then run this again." -ForegroundColor Red; Read-Host "Press Enter"; exit 1 }
if (Select-String -Path "$root\backend\.env" -Pattern "PASTE_YOUR_OPENAI_KEY_HERE" -Quiet) { Write-Host "WARNING: backend\.env still has PASTE_YOUR_OPENAI_KEY_HERE. Tests and videos need a real OpenAI key." -ForegroundColor Yellow }

Set-Location "$root\backend"
docker compose up -d postgres redis minio
$py = "$root\backend\venv\Scripts\python.exe"

function Open-Window($title, $dir, $cmd) {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='$title'; Set-Location '$dir'; $cmd"
}
Open-Window "1 API"            "$root\backend"  "& '$py' -m uvicorn app.main:app --port 8000 --reload"
Open-Window "2 Adaptive worker" "$root\backend" "& '$py' -m app.workers.adaptive_consumer"
Open-Window "3 Video worker"   "$root\backend"  "& '$py' -m app.workers.video_generation_consumer"
Open-Window "4 Website"        "$root\frontend" "npm run dev"

Write-Host "Starting... the website opens in about 30 seconds." -ForegroundColor Green
Start-Sleep 30
Start-Process "http://localhost:3000"
