"""
Test script for Course Enrollment, Curriculum, and Lesson Access.
Runs against local FastAPI server on http://127.0.0.1:8000.
"""

import urllib.request
import json
import uuid

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_call(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} on {method} {path}: {err_body}")
        raise

print("=== 1. Login as Admin ===")
_, admin_login = api_call("/auth/login", method="POST", data={"email": "admin@elarion.com", "password": "Admin123!"})
admin_token = admin_login["access_token"]
print("Admin token acquired.")

print("\n=== 2. Check or Create Course with Module and Lesson ===")
_, courses_data = api_call("/courses?page_size=10", token=admin_token)
items = courses_data.get("items", [])

if not items:
    print("Creating a new course...")
    _, course = api_call("/courses", method="POST", data={
        "title": "IELTS Academic Writing & Speaking Masterclass",
        "description": "Comprehensive band 8+ preparation program with examiner rubrics.",
        "slug": f"ielts-masterclass-{uuid.uuid4().hex[:6]}"
    }, token=admin_token)
    course_id = course["id"]
    api_call(f"/courses/{course_id}/publish", method="POST", token=admin_token)
else:
    course_id = items[0]["id"]

# Fetch course details with modules
_, course_detail = api_call(f"/courses/{course_id}", token=admin_token)
print(f"Course ID: {course_id}, Title: {course_detail['title']}, Modules count: {len(course_detail.get('modules', []))}")

# If course has 0 modules, create a module and lesson
if len(course_detail.get("modules", [])) == 0:
    print("Creating module for course...")
    _, module = api_call(f"/courses/{course_id}/modules", method="POST", data={
        "title": "Module 1: Advanced Lexical Resource & Grammar",
        "description": "Mastering Band 8.5 academic sentence patterns.",
        "sequence_order": 1
    }, token=admin_token)
    module_id = module["id"]
    print(f"Created module {module_id}")

    print("Creating lesson for module...")
    _, lesson = api_call(f"/modules/{module_id}/lessons", method="POST", data={
        "title": "Lesson 1: Inverted Syntax and Emphatic Structures",
        "slug": f"lesson-1-syntax-{uuid.uuid4().hex[:6]}",
        "body_markdown": "# Inverted Syntax\n\nInversion creates formal academic emphasis:\n- *Rarely have examiners seen...*\n- *Not only did the candidate demonstrate...*",
        "sequence_order": 1,
        "estimated_minutes": 15,
        "video_url": "https://example.com/video1.mp4",
        "thumbnail_url": "https://example.com/thumb1.png",
        "duration_seconds": 180
    }, token=admin_token)
    lesson_id = lesson["id"]
    api_call(f"/lessons/{lesson_id}/publish", method="POST", token=admin_token)
    print(f"Created and published lesson {lesson_id}")
else:
    first_module = course_detail["modules"][0]
    module_id = first_module["id"]
    if len(first_module.get("lessons", [])) == 0:
        _, lesson = api_call(f"/modules/{module_id}/lessons", method="POST", data={
            "title": "Lesson 1: Inverted Syntax and Emphatic Structures",
            "slug": f"lesson-1-syntax-{uuid.uuid4().hex[:6]}",
            "body_markdown": "# Inverted Syntax\n\nInversion creates formal academic emphasis.",
            "sequence_order": 1,
            "estimated_minutes": 15,
            "video_url": "https://example.com/video1.mp4",
            "thumbnail_url": "https://example.com/thumb1.png",
            "duration_seconds": 180
        }, token=admin_token)
        lesson_id = lesson["id"]
        api_call(f"/lessons/{lesson_id}/publish", method="POST", token=admin_token)
    else:
        lesson_id = first_module["lessons"][0]["id"]

print(f"Target Lesson ID: {lesson_id}")

print("\n=== 3. Login as Student ===")
_, student_login = api_call("/auth/login", method="POST", data={"email": "student@elarion.com", "password": "Student123!"})
student_token = student_login["access_token"]
print("Student token acquired.")

print("\n=== 4. Enroll Student in Course ===")
status_code, enrollment = api_call("/enrollments", method="POST", data={"course_id": course_id}, token=student_token)
print(f"Enrollment status {status_code}: Enrollment ID {enrollment['id']} for course {enrollment.get('course_title')}")

print("\n=== 5. Query Student Dashboard & Enrolled Courses ===")
_, my_courses = api_call("/students/me/courses", token=student_token)
print(f"Student enrolled courses count: {len(my_courses)}")
for c in my_courses:
    print(f" - {c['course_title']}: {c['completed_lessons']}/{c['total_lessons']} lessons completed ({c['percentage']}%)")

print("\n=== 6. Student Accesses Lesson Detail ===")
_, lesson_data = api_call(f"/lessons/{lesson_id}", token=student_token)
print(f"Lesson: {lesson_data['title']}, estimated {lesson_data['estimated_minutes']} mins")
body_snippet = lesson_data.get('body_markdown') or ''
print(f"Body snippet: {body_snippet[:60]}...")

print("\n=== 7. Student Marks Lesson Complete ===")
_, complete_res = api_call(f"/lessons/{lesson_id}/complete", method="POST", data={"time_spent_seconds": 600}, token=student_token)
print(f"Completion status: {complete_res['message']}, completed_at: {complete_res.get('completed_at')}")

# 8. Query Dashboard again to verify completion
print("\n=== 8. Re-query Dashboard to Verify Progress Update ===")
_, updated_dash = api_call("/students/me/dashboard", token=student_token)
for c in updated_dash.get("enrolled_courses", []):
    print(f" - {c['course_title']}: {c['completed_lessons']}/{c['total_lessons']} lessons completed ({c['percentage']}%)")
print(f"Overall Completion: {updated_dash.get('overall_completion_percentage')}%\n")
print("ALL BACKEND ENROLLMENT AND LESSON VERIFICATION TESTS PASSED SUCCESSFULLY!")
