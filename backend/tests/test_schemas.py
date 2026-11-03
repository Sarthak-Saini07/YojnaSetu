import pytest
from pydantic import ValidationError

from app.schemas.user import UserProfile, UserCreate
from app.schemas.scheme import (
    SchemeCreate,
    EligibilityRules,
    AgeRule,
    IncomeRule,
    GovernmentInfo,
    ApplicationInfo,
    SourceInfo,
)


def test_user_profile_valid():
    profile = UserProfile(
        age=22,
        gender="male",
        state="Punjab",
        annual_income=250000.0,
        occupation="student",
        education="undergraduate",
        is_student=True,
    )
    assert profile.age == 22
    assert profile.state == "Punjab"
    assert profile.annual_income == 250000.0
    assert profile.is_student is True
    assert profile.is_farmer is None  # Defaults to None (unspecified/uncertain)


def test_user_profile_invalid_age():
    with pytest.raises(ValidationError):
        UserProfile(age=-5)

    with pytest.raises(ValidationError):
        UserProfile(age=150)


def test_user_create_schema():
    user_data = UserCreate(
        email="student@example.com",
        password="secretpassword123",
        profile=UserProfile(age=21, state="Haryana"),
    )
    assert user_data.email == "student@example.com"
    assert user_data.profile.state == "Haryana"


def test_scheme_create_validation():
    scheme_dict = {
        "name": "PM-KISAN",
        "slug": "pm-kisan",
        "description": "Income support for landholding farmers.",
        "category": ["agriculture"],
        "government": {
            "level": "central",
            "department": "Ministry of Agriculture"
        },
        "eligibility": {
            "age": {"min": 18, "max": None},
            "income": {"min": None, "max": None},
            "occupations": ["farmer"],
            "is_farmer": True,
        },
        "benefits": ["₹6,000 per year"],
        "documents": ["Aadhaar", "Land details"],
        "application": {
            "method": "online",
            "steps": ["Register online"],
            "official_url": "https://pmkisan.gov.in"
        },
        "source": {
            "department": "Ministry of Agriculture",
            "source_url": "https://pmkisan.gov.in",
            "last_verified": "2026-01-15"
        },
        "status": "active"
    }

    scheme = SchemeCreate(**scheme_dict)
    assert scheme.slug == "pm-kisan"
    assert scheme.eligibility.age.min == 18
    assert scheme.eligibility.age.max is None
    assert scheme.eligibility.is_farmer is True


def test_scheme_missing_required_fields():
    with pytest.raises(ValidationError):
        # Missing required official_url in application
        SchemeCreate(
            name="Incomplete Scheme",
            slug="incomplete",
            description="Test",
            category=["general"],
            government=GovernmentInfo(level="central", department="Test"),
            eligibility=EligibilityRules(),
            application=ApplicationInfo(method="online", steps=[], official_url=""),
            source=SourceInfo(department="Test", source_url="Test", last_verified="2026-01-01"),
        )
