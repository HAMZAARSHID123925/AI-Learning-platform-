/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS diagnostic script. */
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const dbUrl = "postgres://neondb_owner:npg_GeiUXE5Plf2r@ep-patient-truth-b47htn2m-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    // Begin transaction so we don't leave partial data
    await client.query("BEGIN");
    
    const instructorRes = await client.query("SELECT id FROM users WHERE email = 'instructor@elarion.com' LIMIT 1");
    if (instructorRes.rows.length === 0) {
      console.log("Instructor not found");
      return;
    }
    const instructorId = instructorRes.rows[0].id;
    
    const courseId = uuidv4();
    const moduleId = uuidv4();
    const lessonId = uuidv4();
    
    console.log(`Course: ${courseId}`);
    await client.query(`
      INSERT INTO courses (id, instructor_id, title, slug, grade, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [courseId, instructorId, "ELARION Smoke Test - Computer Science v4", `elarion-smoke-test-cs-${courseId.substring(0,8)}`, 5, "published"]);
    
    console.log(`Module: ${moduleId}`);
    await client.query(`
      INSERT INTO course_modules (id, course_id, title, sequence_order, created_at)
      VALUES ($1, $2, $3, 1, NOW())
    `, [moduleId, courseId, "Computer Basics"]);
    
    console.log(`Lesson: ${lessonId}`);
    await client.query(`
      INSERT INTO lessons (id, module_id, title, slug, status, sequence_order, content_version, video_object_key, body_markdown, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 1, 1, $6, $7, NOW(), NOW())
    `, [lessonId, moduleId, "CPU vs RAM Explained Simply", `cpu-vs-ram-${lessonId.substring(0,8)}`, "published", "computer science/CPU-vs-RAM-Explained-Simply.mp4", "This is a smoke test lesson to test real video playback from R2."]);
    
    await client.query("COMMIT");
    
    console.log(`COURSE_ID=${courseId}`);
    console.log(`MODULE_ID=${moduleId}`);
    console.log(`LESSON_ID=${lessonId}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
