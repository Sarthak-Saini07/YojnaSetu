import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.user import UserProfile
from app.schemas.scheme import SchemeCreate
from app.eligibility.engine import evaluate_scheme
from app.repositories.scheme_repository import scheme_repository
from scripts.seed_schemes import SEED_SCHEMES

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_seed_data():
    """Ensure sample schemes are loaded into repository before eligibility tests."""
    for raw_scheme in SEED_SCHEMES:
        scheme_obj = SchemeCreate(**raw_scheme)
        scheme_repository.upsert_scheme(scheme_obj.model_dump())


def test_evaluator_age_boundaries():
    scheme_data = {
        "name": "Youth Scheme",
        "slug": "youth-scheme",
        "description": "Test scheme for youth",
        "category": ["education"],
        "government": {"level": "central", "department": "Education"},
        "eligibility": {"age": {"min": 18, "max": 30}},
        "benefits": ["Benefit 1"],
        "documents": ["Aadhaar"],
        "application": {"method": "online", "steps": [], "official_url": "https://gov.in"},
        "source": {"department": "Education", "source_url": "https://gov.in", "last_verified": "2026-02-15"},
    }

    # 1. Exact Min Age (18) -> ELIGIBLE
    prof_18 = UserProfile(age=18)
    res_18 = evaluate_scheme(prof_18, scheme_data)
    assert res_18["status"] == "ELIGIBLE"
    assert res_18["eligible"] is True
    assert res_18["match_score"] == 100

    # 2. Exact Max Age (30) -> ELIGIBLE
    prof_30 = UserProfile(age=30)
    res_30 = evaluate_scheme(prof_30, scheme_data)
    assert res_30["status"] == "ELIGIBLE"
    assert res_30["eligible"] is True
    assert res_30["match_score"] == 100

    # 3. One year below Min Age (17) -> NOT ELIGIBLE
    prof_17 = UserProfile(age=17)
    res_17 = evaluate_scheme(prof_17, scheme_data)
    assert res_17["status"] == "NOT ELIGIBLE"
    assert res_17["eligible"] is False
    assert res_17["match_score"] == 0
    assert any("below minimum required age" in msg for msg in res_17["failed_conditions"])

    # 4. One year above Max Age (31) -> NOT ELIGIBLE
    prof_31 = UserProfile(age=31)
    res_31 = evaluate_scheme(prof_31, scheme_data)
    assert res_31["status"] == "NOT ELIGIBLE"
    assert res_31["eligible"] is False
    assert res_31["match_score"] == 0
    assert any("exceeds maximum allowed age" in msg for msg in res_31["failed_conditions"])


def test_evaluator_income_boundaries():
    scheme_data = {
        "name": "Income Cap Scheme",
        "slug": "income-cap-scheme",
        "description": "Test scheme for low income",
        "category": ["welfare"],
        "government": {"level": "central", "department": "Welfare"},
        "eligibility": {"income": {"max": 300000}},
        "benefits": ["Benefit 1"],
        "documents": ["Income certificate"],
        "application": {"method": "online", "steps": [], "official_url": "https://gov.in"},
        "source": {"department": "Welfare", "source_url": "https://gov.in", "last_verified": "2026-02-15"},
    }

    # 1. Exact Income Limit (300,000) -> ELIGIBLE
    prof_exact = UserProfile(annual_income=300000)
    res_exact = evaluate_scheme(prof_exact, scheme_data)
    assert res_exact["status"] == "ELIGIBLE"
    assert res_exact["eligible"] is True
    assert res_exact["match_score"] == 100

    # 2. One Rupee Above Limit (300,001) -> NOT ELIGIBLE
    prof_above = UserProfile(annual_income=300001)
    res_above = evaluate_scheme(prof_above, scheme_data)
    assert res_above["status"] == "NOT ELIGIBLE"
    assert res_above["eligible"] is False
    assert res_above["match_score"] == 0
    assert any("exceeds maximum allowed limit" in msg for msg in res_above["failed_conditions"])


def test_insufficient_information_outcome_and_score_nullification():
    scheme_data = {
        "name": "Punjab Youth Assistance",
        "slug": "punjab-youth-assistance",
        "description": "Assistance for youth in Punjab",
        "category": ["welfare"],
        "government": {"level": "state", "department": "Social Welfare"},
        "eligibility": {
            "age": {"min": 18, "max": 30},
            "income": {"max": 300000},
            "states": ["Punjab"],
        },
        "benefits": ["Financial grant"],
        "documents": ["Income cert", "Domicile"],
        "application": {"method": "online", "steps": [], "official_url": "https://punjab.gov.in"},
        "source": {"department": "Social Welfare", "source_url": "https://punjab.gov.in", "last_verified": "2026-02-15"},
    }

    # User provides age=22 and state="Punjab", BUT annual_income is missing (None)
    partial_profile = UserProfile(
        age=22,
        state="Punjab",
        annual_income=None,  # Missing required field!
    )

    res = evaluate_scheme(partial_profile, scheme_data)

    # Must produce INSUFFICIENT INFORMATION outcome
    assert res["status"] == "INSUFFICIENT INFORMATION"
    assert res["eligible"] is False
    assert res["is_insufficient_info"] is True

    # Crucial Verification: match_score MUST be None (not 100 or misleading score)
    assert res["match_score"] is None
    assert res["match_score"] != 100

    assert len(res["failed_conditions"]) == 0
    assert len(res["missing_information"]) == 1
    assert "Annual income is required to determine eligibility." in res["missing_information"]
    assert len(res["matched_conditions"]) == 2  # Age and State passed!


def test_state_matching_and_rejection():
    punjab_scheme = scheme_repository.get_by_slug("punjab-ashirwad-scheme")
    assert punjab_scheme is not None

    # 1. Punjab Resident Female -> ELIGIBLE
    punjab_user = UserProfile(
        age=22,
        gender="female",
        state="Punjab",
        annual_income=25000,
        category="sc",
    )
    res_pb = evaluate_scheme(punjab_user, punjab_scheme)
    assert res_pb["status"] == "ELIGIBLE"
    assert res_pb["match_score"] == 100

    # 2. Haryana Resident -> NOT ELIGIBLE due to state restriction
    haryana_user = UserProfile(
        age=22,
        gender="female",
        state="Haryana",
        annual_income=25000,
        category="sc",
    )
    res_hr = evaluate_scheme(haryana_user, punjab_scheme)
    assert res_hr["status"] == "NOT ELIGIBLE"
    assert res_hr["match_score"] is not None
    assert res_hr["match_score"] < 100
    assert any("not eligible for this state scheme" in msg for msg in res_hr["failed_conditions"])


def test_eligibility_check_api_endpoint():
    payload = {
        "profile": {
            "age": 35,
            "state": "Punjab",
            "occupation": "farmer",
            "is_farmer": True,
        },
        "scheme_id": "pm-kisan",
    }

    response = client.post("/api/eligibility/check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scheme_slug"] == "pm-kisan"
    assert data["status"] == "ELIGIBLE"
    assert data["eligible"] is True
    assert data["match_score"] == 100
    assert any("farmer" in msg.lower() for msg in data["matched_conditions"])
