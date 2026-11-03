import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.scheme_repository import scheme_repository
from app.schemas.scheme import SchemeCreate
from scripts.seed_schemes import SEED_SCHEMES
from app.services.auth_service import auth_service
from app.auth.security import create_access_token

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_seed_data():
    """Ensure sample schemes are loaded into repository before scheme tests."""
    for raw_scheme in SEED_SCHEMES:
        scheme_obj = SchemeCreate(**raw_scheme)
        scheme_repository.upsert_scheme(scheme_obj.model_dump())


def test_list_schemes_pagination_and_filtering():
    # 1. Test Pagination (page=1, limit=5)
    response = client.get("/api/schemes?page=1&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 5
    assert data["total"] >= 15
    assert data["page"] == 1
    assert data["limit"] == 5

    # 2. Test Category Filtering
    agri_res = client.get("/api/schemes?category=agriculture")
    assert agri_res.status_code == 200
    agri_data = agri_res.json()
    assert len(agri_data["items"]) >= 1
    for item in agri_data["items"]:
        assert "agriculture" in [c.lower() for c in item["category"]]

    # 3. Test State Filtering (Punjab)
    punjab_res = client.get("/api/schemes?state=Punjab&limit=50")
    assert punjab_res.status_code == 200
    punjab_data = punjab_res.json()
    assert len(punjab_data["items"]) >= 1
    has_punjab_scheme = any("Punjab" in s["eligibility"]["states"] for s in punjab_data["items"])
    assert has_punjab_scheme is True

    # 4. Test Search Keyword
    search_res = client.get("/api/schemes?search=PM-KISAN")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert len(search_data["items"]) >= 1
    assert "PM-KISAN" in search_data["items"][0]["name"]


def test_get_scheme_by_slug_and_404():
    # 1. Fetch valid scheme by slug
    response = client.get("/api/schemes/pm-kisan")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "pm-kisan"
    assert data["government"]["level"] == "central"

    # 2. Fetch non-existent scheme
    bad_res = client.get("/api/schemes/non-existent-scheme-slug-123")
    assert bad_res.status_code == 404


import uuid


def test_admin_scheme_crud_and_authorization():
    u_suffix = uuid.uuid4().hex[:8]
    # Setup Registered Regular User
    reg_user = auth_service.register_user(
        type("UserCreateMock", (), {
            "email": f"regular.citizen.{u_suffix}@example.com",
            "password": "UserPassword123!",
            "role": "user",
            "profile": type("ProfileMock", (), {"model_dump": lambda self: {}})(),
        })()
    )
    user_token = create_access_token({"sub": reg_user["email"], "role": "user"})
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Setup Registered Admin User
    admin_user = auth_service.register_user(
        type("UserCreateMock", (), {
            "email": f"admin.officer.{u_suffix}@example.com",
            "password": "AdminPassword123!",
            "role": "admin",
            "profile": type("ProfileMock", (), {"model_dump": lambda self: {}})(),
        })()
    )
    admin_token = create_access_token({"sub": admin_user["email"], "role": "admin"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    test_slug = f"pm-research-grant-{u_suffix}"
    new_scheme_payload = {
        "name": "PM Research Innovation Grant",
        "slug": test_slug,
        "description": "Grant for student researchers.",
        "category": ["education", "research"],
        "government": {
            "level": "central",
            "department": "Ministry of Science & Technology"
        },
        "eligibility": {
            "age": {"min": 18, "max": 30},
            "income": {"min": None, "max": 600000},
            "states": [],
            "districts": [],
            "occupations": ["student"],
            "education": ["postgraduate"],
            "gender": [],
            "categories": [],
            "is_student": True,
        },
        "benefits": ["Grant of ₹20,000 per month"],
        "documents": ["Aadhaar", "Research Proposal"],
        "application": {
            "method": "online",
            "steps": ["Apply online"],
            "official_url": "https://research.gov.in"
        },
        "source": {
            "department": "Ministry of Science & Technology",
            "source_url": "https://research.gov.in",
            "last_verified": "2026-02-15"
        },
        "status": "active"
    }

    # 1. Non-admin attempt to create scheme -> 403 Forbidden
    forbidden_res = client.post("/api/schemes", json=new_scheme_payload, headers=user_headers)
    assert forbidden_res.status_code == 403

    # 2. Admin creates scheme -> 201 Created
    create_res = client.post("/api/schemes", json=new_scheme_payload, headers=admin_headers)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["slug"] == test_slug

    # 3. Admin updates scheme -> 200 OK
    update_res = client.put(
        f"/api/schemes/{test_slug}",
        json={"description": "Updated research grant description."},
        headers=admin_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["description"] == "Updated research grant description."

    # 4. Non-admin attempt to delete scheme -> 403 Forbidden
    del_forbidden = client.delete(f"/api/schemes/{test_slug}", headers=user_headers)
    assert del_forbidden.status_code == 403

    # 5. Admin soft-deletes scheme -> 200 OK
    del_res = client.delete(f"/api/schemes/{test_slug}", headers=admin_headers)
    assert del_res.status_code == 200
    assert "archived" in del_res.json()["message"].lower()
