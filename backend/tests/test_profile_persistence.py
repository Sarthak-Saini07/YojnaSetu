import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.user_repository import user_repository

client = TestClient(app)


def test_user_registration_and_persistent_profile():
    """Verify registration creates user in MongoDB with hashed password and saved profile."""
    uid = uuid.uuid4().hex[:8]
    test_email = f"citizen.{uid}@example.com"
    test_password = "SecurePassword#2026"

    # Register with complete profile
    register_payload = {
        "name": "Harpreet Singh",
        "full_name": "Harpreet Singh",
        "email": test_email,
        "password": test_password,
        "phone": "+919876543210",
        "role": "user",
        "profile": {
            "date_of_birth": "2002-06-15",
            "gender": "Male",
            "state": "Punjab",
            "district": "Jalandhar",
            "annual_income": 250000,
            "education": "undergraduate",
            "occupation": "student",
            "category": "SC",
            "marital_status": "single",
            "family_members": 4,
            "is_student": True,
            "is_farmer": False,
            "is_disabled": False,
        },
    }

    reg_resp = client.post("/api/auth/register", json=register_payload)
    assert reg_resp.status_code == 201, reg_resp.text
    reg_data = reg_resp.json()
    assert reg_data["message"] == "Registration successful"
    user_res = reg_data["user"]
    assert user_res["email"] == test_email
    assert user_res["name"] == "Harpreet Singh"
    assert "password" not in user_res
    assert "password_hash" not in user_res
    # Age should be automatically calculated from date of birth
    assert user_res["profile"]["age"] is not None
    assert user_res["profile"]["age"] >= 23
    assert user_res["profile"]["state"] == "Punjab"
    assert user_res["profile"]["profile_completion_percentage"] == 100

    # Verify directly in MongoDB/Repository that password is NOT plain text
    db_user = user_repository.get_by_email(test_email)
    assert db_user is not None
    assert db_user["password_hash"] != test_password
    assert db_user["password_hash"].startswith("$2b$") or db_user["password_hash"].startswith("$2a$")
    assert db_user["profile"]["district"] == "Jalandhar"

    # Duplicate registration check
    dup_resp = client.post("/api/auth/register", json=register_payload)
    assert dup_resp.status_code == 400
    assert "already registered" in dup_resp.json()["detail"].lower()


def test_login_and_persistent_profile_retrieval():
    """Verify login restores the user's previously saved profile without creating new documents."""
    uid = uuid.uuid4().hex[:8]
    test_email = f"login_test.{uid}@example.com"
    test_password = "SecretLoginPass!12"

    # Register user
    reg_payload = {
        "name": "Simran Kaur",
        "email": test_email,
        "password": test_password,
        "phone": "+919811122233",
        "profile": {
            "date_of_birth": "2000-01-10",
            "gender": "Female",
            "state": "Punjab",
            "district": "Ludhiana",
            "annual_income": 180000,
            "education": "postgraduate",
            "occupation": "student",
            "category": "General",
            "is_student": True,
            "is_farmer": False,
            "is_disabled": False,
        },
    }
    client.post("/api/auth/register", json=reg_payload)

    # Login
    login_resp = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": test_password},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["user"]["name"] == "Simran Kaur"
    assert login_data["user"]["profile"]["district"] == "Ludhiana"
    assert login_data["user"]["profile"]["state"] == "Punjab"
    assert "password_hash" not in login_data["user"]

    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify /api/auth/me retrieves current user and profile
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == test_email
    assert me_data["name"] == "Simran Kaur"
    assert me_data["profile"]["state"] == "Punjab"

    # Verify /api/profile retrieves current user profile
    prof_resp = client.get("/api/profile", headers=headers)
    assert prof_resp.status_code == 200
    prof_data = prof_resp.json()
    assert prof_data["state"] == "Punjab"
    assert prof_data["district"] == "Ludhiana"
    assert prof_data["education"] == "postgraduate"

    # Verify logout endpoint
    logout_resp = client.post("/api/auth/logout", headers=headers)
    assert logout_resp.status_code == 200
    assert logout_resp.json()["message"] == "Logged out successfully"


def test_profile_update_and_persistence():
    """Verify updating profile persists immediately and retains unchanged fields."""
    uid = uuid.uuid4().hex[:8]
    test_email = f"update_test.{uid}@example.com"
    test_password = "PasswordUpdate#123"

    reg_payload = {
        "name": "Gurpreet Singh",
        "email": test_email,
        "password": test_password,
        "profile": {
            "date_of_birth": "1995-04-20",
            "gender": "Male",
            "state": "Punjab",
            "district": "Patiala",
            "annual_income": 150000,
            "occupation": "farmer",
            "education": "secondary",
            "category": "OBC",
            "is_farmer": True,
            "is_student": False,
            "is_disabled": False,
        },
    }
    client.post("/api/auth/register", json=reg_payload)

    login_resp = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": test_password},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update only annual income and district via PUT /api/profile
    update_resp = client.put(
        "/api/profile",
        headers=headers,
        json={
            "annual_income": 320000,
            "district": "Bathinda",
        },
    )
    assert update_resp.status_code == 200
    updated_prof = update_resp.json()
    assert updated_prof["annual_income"] == 320000
    assert updated_prof["district"] == "Bathinda"
    # Unchanged fields MUST be preserved
    assert updated_prof["state"] == "Punjab"
    assert updated_prof["occupation"] == "farmer"
    assert updated_prof["is_farmer"] is True

    # Re-fetch via GET /api/auth/me to confirm persistence in DB
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.json()["profile"]["annual_income"] == 320000
    assert me_resp.json()["profile"]["district"] == "Bathinda"
    assert me_resp.json()["profile"]["state"] == "Punjab"


def test_authenticated_recommendations_integration():
    """Verify recommendations engine uses authenticated user's saved profile from MongoDB."""
    uid = uuid.uuid4().hex[:8]
    test_email = f"farmer_user.{uid}@example.com"
    test_password = "FarmerPass#2026"

    # Register farmer in Punjab with low income
    reg_payload = {
        "name": "Kisan Balwinder",
        "email": test_email,
        "password": test_password,
        "profile": {
            "age": 42,
            "gender": "Male",
            "state": "Punjab",
            "district": "Amritsar",
            "annual_income": 120000,
            "occupation": "farmer",
            "education": "secondary",
            "category": "General",
            "is_farmer": True,
            "is_student": False,
            "is_disabled": False,
        },
    }
    client.post("/api/auth/register", json=reg_payload)

    login_resp = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": test_password},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Call /api/eligibility/me without passing body
    rec_resp = client.get("/api/eligibility/me", headers=headers)
    assert rec_resp.status_code == 200
    rec_data = rec_resp.json()
    assert rec_data["total_evaluated"] >= 40
    assert rec_data["eligible_count"] > 0

    eligible_slugs = [item["scheme_slug"] for item in rec_data["grouped"]["eligible"]]
    # A farmer in Punjab with ₹1.2L income satisfies PM-KISAN, PMFBY, KCC
    assert "pm-kisan" in eligible_slugs
    assert "pm-fasal-bima-yojana" in eligible_slugs
    assert "kisan-credit-card" in eligible_slugs

    # Update profile to student with high income and verify recommendation changes
    client.put(
        "/api/profile",
        headers=headers,
        json={
            "occupation": "student",
            "is_farmer": False,
            "is_student": True,
            "annual_income": 300000,
            "age": 20,
            "education": "undergraduate",
        },
    )

    rec_resp2 = client.get("/api/eligibility/me", headers=headers)
    rec_data2 = rec_resp2.json()
    eligible_slugs2 = [item["scheme_slug"] for item in rec_data2["grouped"]["eligible"]]
    ineligible_slugs2 = [item["scheme_slug"] for item in rec_data2["grouped"]["not_eligible"]]

    # Farmer schemes should now be in not_eligible or insufficient info
    assert "pm-kisan" not in eligible_slugs2
    assert "pm-kisan" in ineligible_slugs2
    # Student loan/scholarship schemes should now appear
    assert "pm-vidya-lakshmi" in eligible_slugs2 or "pm-usp-csis" in eligible_slugs2
