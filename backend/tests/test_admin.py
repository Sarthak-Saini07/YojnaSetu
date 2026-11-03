import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.auth.security import create_access_token
from app.repositories.user_repository import user_repository
from app.repositories.scheme_repository import scheme_repository

client = TestClient(app)


@pytest.fixture
def admin_token():
    """Create an admin user and return a valid JWT bearer token."""
    email = "testadmin@example.com"
    user_data = {
        "email": email,
        "password_hash": "hashed_pass",
        "role": "admin",
        "profile": {},
    }
    user_repository.create_user(user_data)
    token = create_access_token({"sub": email, "role": "admin"})
    return token


@pytest.fixture
def normal_user_token():
    """Create a normal user and return a valid JWT bearer token."""
    email = "normaluser@example.com"
    user_data = {
        "email": email,
        "password_hash": "hashed_pass",
        "role": "user",
        "profile": {},
    }
    user_repository.create_user(user_data)
    token = create_access_token({"sub": email, "role": "user"})
    return token


import uuid


def test_admin_can_create_and_update_scheme(admin_token):
    """Test that authenticated admin user can create and update scheme."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    slug = f"admin-test-scholarship-{uuid.uuid4().hex[:8]}"
    payload = {
        "name": "Admin Test Scholarship Scheme",
        "slug": slug,
        "description": "Scheme created by admin for testing",
        "category": ["education"],
        "government": {"level": "central", "department": "Department of Education"},
        "eligibility": {"age": {"min": 18, "max": 30}, "states": ["Punjab"]},
        "benefits": ["Financial grant of 50,000"],
        "documents": ["Aadhaar"],
        "application": {"method": "online", "official_url": "https://scholarships.gov.in"},
        "source": {"department": "Education", "source_url": "https://scholarships.gov.in", "last_verified": "2026-09-17"},

        "status": "active",
    }

    # 1. Create scheme
    res_create = client.post("/api/schemes", json=payload, headers=headers)
    assert res_create.status_code == 201
    created_data = res_create.json()
    assert created_data["name"] == payload["name"]

    # 2. Update scheme
    update_payload = {"description": "Updated description by admin"}
    res_update = client.put(f"/api/schemes/{payload['slug']}", json=update_payload, headers=headers)
    assert res_update.status_code == 200
    assert res_update.json()["description"] == "Updated description by admin"


def test_normal_user_cannot_perform_admin_operations(normal_user_token):
    """Test that normal user gets 403 Forbidden on admin operations (Requirement #4 & #6)."""
    headers = {"Authorization": f"Bearer {normal_user_token}"}
    payload = {
        "name": "Unauthorized Scheme",
        "slug": "unauthorized-scheme",
        "description": "Attempted by non-admin user",
        "application": {"official_url": "https://example.gov.in"},
        "source": {"last_verified": "2026-09-17"},
    }

    # POST create attempt
    res_create = client.post("/api/schemes", json=payload, headers=headers)
    assert res_create.status_code == 403
    assert "Admin privileges required" in res_create.json()["detail"]

    # DELETE archive attempt
    res_delete = client.delete("/api/schemes/test-scheme", headers=headers)
    assert res_delete.status_code == 403


def test_archived_schemes_excluded_from_recommendations(admin_token):
    """Test that archiving a scheme excludes it from recommendation engine results (Requirement #4 & #5)."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    slug = f"scheme-to-be-archived-{uuid.uuid4().hex[:8]}"
    payload = {
        "name": "Archive Test Scheme",
        "slug": slug,
        "description": "Scheme to test archiving exclusion",
        "category": ["test"],
        "government": {"level": "central", "department": "Test Dept"},
        "eligibility": {"age": {"min": 18, "max": 60}},
        "application": {"official_url": "https://test.gov.in"},
        "source": {"department": "Test Dept", "source_url": "https://test.gov.in", "last_verified": "2026-09-17"},

        "status": "active",
    }

    # Create active scheme
    res_create = client.post("/api/schemes", json=payload, headers=headers)
    assert res_create.status_code == 201

    # Archive the scheme
    res_archive = client.delete(f"/api/schemes/{slug}", headers=headers)
    assert res_archive.status_code == 200

    # Run recommendation check
    user_prof = {"profile": {"age": 25, "state": "Punjab"}}
    res_rec = client.post("/api/eligibility/recommend", json=user_prof)
    assert res_rec.status_code == 200
    rec_data = res_rec.json()

    # Ensure archived scheme slug is not present in recommendation results
    all_slugs = [r["scheme_slug"] for r in rec_data["results"]]
    assert slug not in all_slugs
