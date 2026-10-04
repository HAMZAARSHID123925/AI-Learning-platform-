import pytest
from pydantic import ValidationError

from app.modules.module1_auth.schemas import RegisterRequest
from app.modules.module2_content.schemas import CreateCourseRequest

def test_user_grade_valid():
    req = RegisterRequest(
        email="test@example.com",
        password="Password123!",
        first_name="John",
        last_name="Doe",
        grade=5
    )
    assert req.grade == 5

def test_user_grade_invalid_too_high():
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="test@example.com",
            password="Password123!",
            first_name="John",
            last_name="Doe",
            grade=6
        )

def test_user_grade_invalid_too_low():
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="test@example.com",
            password="Password123!",
            first_name="John",
            last_name="Doe",
            grade=0
        )

def test_course_grade_valid():
    req = CreateCourseRequest(
        title="Math 101",
        grade=1
    )
    assert req.grade == 1

def test_course_grade_invalid():
    with pytest.raises(ValidationError):
        CreateCourseRequest(
            title="Math 101",
            grade=6
        )
