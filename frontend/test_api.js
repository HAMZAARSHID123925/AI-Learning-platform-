/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS diagnostic script. */
const fs = require('fs');

async function testLessonApi() {
  try {
    const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'instructor@elarion.com', password: 'Instructor123!' })
    });
    
    if (!loginRes.ok) {
      console.log('Login failed', await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    
    const lessonRes = await fetch('http://localhost:8000/api/v1/lessons/ed044eed-aa94-4c29-bf92-d2ff91948e62', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!lessonRes.ok) {
      console.log('Lesson fetch failed', await lessonRes.text());
      return;
    }
    
    const lessonData = await lessonRes.json();
    console.log("Lesson Fetched Successfully");
    console.log("ID:", lessonData.id);
    console.log("Title:", lessonData.title);
    console.log("Video URL (first 100 chars):", lessonData.video_url?.substring(0, 100) + '...');
    
  } catch(e) {
    console.error(e);
  }
}

testLessonApi();
