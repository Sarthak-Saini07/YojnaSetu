import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.user import UserProfile
from app.schemas.scheme import SchemeCreate
from app.repositories.scheme_repository import scheme_repository
from app.recommendation.engine import generate_recommendations
from scripts.seed_schemes import SEED_SCHEMES

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_seed_data():
    """Ensure sample schemes are loaded into repository before recommendation tests."""
    for raw_scheme in SEED_SCHEMES:
        scheme_obj = SchemeCreate(**raw_scheme)
        scheme_repository.upsert_scheme(scheme_obj.model_dump())


def test_eligible_schemes_ranked_before_ineligible():
    # Punjab farmer profile
    farmer_profile = UserProfile(
        age=30,
        gender="male",
        state="Punjab",
        annual_income=200000,
        occupation="farmer",
        is_farmer=True,
    )

    res = generate_recommendations(profile=farmer_profile)
    results = res["results"]

    assert len(results) > 0

    # Collect status sequence
    statuses = [r["status"] for r in results]

    # Verify Tier Ordering: ELIGIBLE -> INSUFFICIENT INFORMATION -> NOT ELIGIBLE
    eligible_indices = [i for i, s in enumerate(statuses) if s == "ELIGIBLE"]
    insufficient_indices = [i for i, s in enumerate(statuses) if s == "INSUFFICIENT INFORMATION"]
    not_eligible_indices = [i for i, s in enumerate(statuses) if s == "NOT ELIGIBLE"]

    if eligible_indices and not_eligible_indices:
        max_eligible_idx = max(eligible_indices)
        min_ineligible_idx = min(not_eligible_indices)
        assert max_eligible_idx < min_ineligible_idx, "All ELIGIBLE schemes must rank BEFORE any NOT ELIGIBLE scheme"

    if eligible_indices and insufficient_indices:
        max_eligible_idx = max(eligible_indices)
        min_insufficient_idx = min(insufficient_indices)
        assert max_eligible_idx < min_insufficient_idx, "All ELIGIBLE schemes must rank BEFORE INSUFFICIENT INFORMATION schemes"


def test_insufficient_information_handling_in_recommendations():
    # Profile missing income and farmer status
    partial_profile = UserProfile(
        age=22,
        state="Punjab",
        # missing annual_income, occupation, is_farmer
    )

    res = generate_recommendations(profile=partial_profile)
    results = res["results"]

    for r in results:
        if r["status"] == "INSUFFICIENT INFORMATION":
            assert r["match_score"] is None, "INSUFFICIENT INFORMATION schemes must have match_score=None"
            assert len(r["missing_information"]) > 0
            assert "required information" in r["recommendation_reason"].lower()


def test_archived_schemes_excluded():
    # Create an archived scheme
    archived_payload = {
        "name": "Old Obsolete Scheme",
        "slug": "old-obsolete-scheme",
        "description": "Archived scheme",
        "category": ["general"],
        "government": {"level": "central", "department": "Department"},
        "eligibility": {"age": {"min": 18, "max": 60}},
        "benefits": ["Benefit"],
        "documents": ["Aadhaar"],
        "application": {"method": "online", "steps": [], "official_url": "https://gov.in"},
        "source": {"department": "Dept", "source_url": "https://gov.in", "last_verified": "2026-02-15"},
        "status": "archived",
    }
    scheme_repository.upsert_scheme(archived_payload)

    profile = UserProfile(age=25, state="Punjab")
    res = generate_recommendations(profile=profile)
    results = res["results"]

    slugs = [r["scheme_slug"] for r in results]
    assert "old-obsolete-scheme" not in slugs, "Archived schemes must be excluded from active recommendations"


def test_deterministic_ranking_and_tie_breaking():
    profile = UserProfile(age=22, state="Punjab", occupation="student", is_student=True)

    res1 = generate_recommendations(profile=profile)
    res2 = generate_recommendations(profile=profile)

    slugs1 = [r["scheme_slug"] for r in res1["results"]]
    slugs2 = [r["scheme_slug"] for r in res2["results"]]
    assert slugs1 == slugs2, "Recommendation ranking must be 100% deterministic"

    ranks = [r["rank"] for r in res1["results"]]
    assert ranks == list(range(1, len(ranks) + 1)), "Ranks must be 1-based sequential integers"


def test_recommendation_api_endpoint():
    payload = {
        "profile": {
            "age": 21,
            "gender": "male",
            "state": "Punjab",
            "annual_income": 200000,
            "occupation": "student",
            "is_student": True,
        },
        "categories": ["education"],
        "limit": 10,
    }

    response = client.post("/api/eligibility/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "total_evaluated" in data
    assert "eligible_count" in data
    assert "results" in data
    assert "grouped" in data
    assert len(data["results"]) <= 10

    # Verify structure of first item
    first_item = data["results"][0]
    assert first_item["rank"] == 1
    assert "recommendation_reason" in first_item
    assert first_item["status"] in ["ELIGIBLE", "INSUFFICIENT INFORMATION", "NOT ELIGIBLE"]
