# ELARION - where did the time go for the latest finished video? (read-only)
$q = @'
WITH j AS (SELECT * FROM video_generation_jobs WHERE status = 'ready' ORDER BY completed_at DESC LIMIT 1),
s AS (SELECT sub.* FROM submissions sub JOIN j ON sub.id = j.submission_id),
p AS (SELECT max(rp.created_at) AS last_plan FROM remediation_plans rp JOIN j ON rp.source_submission_id = j.submission_id)
SELECT left(j.id::text,8) AS job,
 round(extract(epoch FROM (s.graded_at - s.submitted_at))::numeric,0) AS step1_grading_s,
 round(extract(epoch FROM (p.last_plan - s.graded_at))::numeric,0) AS step2_plans_s,
 round(extract(epoch FROM (j.created_at - p.last_plan))::numeric,0) AS step3_page_to_job_s,
 round(extract(epoch FROM (j.completed_at - j.created_at))::numeric - coalesce((j.render_manifest_json->>'render_seconds')::numeric,0) - coalesce((j.render_manifest_json->>'upload_seconds')::numeric,0),0) AS step4_script_voice_s,
 round((j.render_manifest_json->>'render_seconds')::numeric,0) AS step5_render_s,
 round((j.render_manifest_json->>'upload_seconds')::numeric,0) AS step6_upload_s,
 round(extract(epoch FROM (j.completed_at - s.submitted_at))::numeric,0) AS total_seconds,
 round((j.audio_manifest_json->>'total_render_duration_seconds')::numeric,0) AS video_len_s
FROM j, s, p;
'@
docker exec elarion_postgres psql -U elarion_user -d elarion -x -c $q
