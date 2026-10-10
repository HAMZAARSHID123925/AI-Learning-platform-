# ELARION - show the latest video jobs, weak points and remediation plans (read-only)
$q1 = "SELECT left(id::text,8) AS job, status, error_code, left(coalesce(error_message,''),160) AS error, to_char(created_at,'HH24:MI:SS') AS created, to_char(updated_at,'HH24:MI:SS') AS updated FROM video_generation_jobs ORDER BY created_at DESC LIMIT 5;"
$q2 = "SELECT left(id::text,8) AS plan, status, (remedial_course_markdown IS NOT NULL) AS has_text, to_char(created_at,'HH24:MI:SS') AS created FROM remediation_plans ORDER BY created_at DESC LIMIT 5;"
$q3 = "SELECT left(id::text,8) AS flag, status, to_char(created_at,'HH24:MI:SS') AS created FROM weakness_flags ORDER BY created_at DESC LIMIT 5;"
Write-Host "`n=== VIDEO JOBS (newest first) ===" -ForegroundColor Cyan
docker exec elarion_postgres psql -U elarion_user -d elarion -c $q1
Write-Host "=== REMEDIATION PLANS ===" -ForegroundColor Cyan
docker exec elarion_postgres psql -U elarion_user -d elarion -c $q2
Write-Host "=== WEAK POINTS ===" -ForegroundColor Cyan
docker exec elarion_postgres psql -U elarion_user -d elarion -c $q3
