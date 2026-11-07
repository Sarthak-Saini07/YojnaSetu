import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import db_manager
from app.auth.security import create_access_token, verify_password
from app.repositories.user_repository import user_repository
from app.repositories.scheme_repository import scheme_repository

client = TestClient(app)


def test_mongodb_connection_status():
    """Verify requirement #1: MongoDB connection succeeds and is connected."""
    health = db_manager.check_health()
    assert health["status"] == "connected"
    assert health["database_name"] in ("government_scheme_db", "govt_scheme_db", "government_schemes")
    assert health["error"] is None


def test_user_registration_and_password_hashing():
    """Verify requirements #2 & #3: Registration persists in DB and passwords are hashed."""
    uid = uuid.uuid4().hex[:8]
    email = f"citizen.{uid}@example.com"
    raw_pwd = "MySecretPassword#2026"

    # Register user
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": raw_pwd,
            "name": f"Citizen {uid}",
            "profile": {"state": "Punjab", "age": 24, "annual_income": 300000},
        },
    )
    assert reg_res.status_code == 201
    user_data = reg_res.json()["user"]
    assert user_data["email"] == email
    assert user_data["role"] == "user"

    # Check database record directly
    db_user = user_repository.get_by_email(email)
    assert db_user is not None
    assert db_user["password_hash"] != raw_pwd
    assert verify_password(raw_pwd, db_user["password_hash"]) is True


def test_login_returns_valid_jwt():
    """Verify requirement #4: Login returns a valid signed JWT."""
    uid = uuid.uuid4().hex[:8]
    email = f"jwt_user.{uid}@example.com"
    pwd = "ValidPass!123"

    client.post(
        "/api/auth/register",
        json={"email": email, "password": pwd, "name": "JWT User"},
    )

    login_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": pwd},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert len(token_data["access_token"]) > 20


def test_authenticated_endpoints_and_unauthenticated_rejection():
    """Verify requirements #5 & #6: Permitted access for auth users and 401 for unauth."""
    # Unauthenticated request -> 401
    unauth_res = client.get("/api/auth/me")
    assert unauth_res.status_code == 401

    unauth_profile = client.get("/api/profile")
    assert unauth_profile.status_code == 401

    # Authenticated user
    uid = uuid.uuid4().hex[:8]
    email = f"auth_user.{uid}@example.com"
    token = create_access_token({"sub": email, "role": "user"})
    user_repository.create_user({"email": email, "password_hash": "hash", "role": "user", "profile": {"state": "Punjab"}})
    headers = {"Authorization": f"Bearer {token}"}

    auth_me = client.get("/api/auth/me", headers=headers)
    assert auth_me.status_code == 200
    assert auth_me.json()["email"] == email

    auth_prof = client.get("/api/profile", headers=headers)
    assert auth_prof.status_code == 200
    assert auth_prof.json()["state"] == "Punjab"


def test_rbac_access_restrictions():
    """Verify requirements #7 & #8: Normal users cannot access admin endpoints, admins can."""
    uid = uuid.uuid4().hex[:8]
    # Citizen
    citizen_email = f"citizen.{uid}@example.com"
    user_repository.create_user({"email": citizen_email, "password_hash": "hash", "role": "user", "profile": {}})
    citizen_token = create_access_token({"sub": citizen_email, "role": "user"})
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # Admin
    admin_email = f"admin.{uid}@example.com"
    user_repository.create_user({"email": admin_email, "password_hash": "hash", "role": "admin", "profile": {}})
    admin_token = create_access_token({"sub": admin_email, "role": "admin"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Citizen cannot view system information -> 403
    assert client.get("/api/admin/system", headers=citizen_headers).status_code == 403

    # 2. Citizen cannot list users -> 403
    assert client.get("/api/users", headers=citizen_headers).status_code == 403

    # 3. Citizen cannot create schemes -> 403
    assert client.post("/api/schemes", json={"name": "Fake Scheme"}, headers=citizen_headers).status_code == 403

    # 4. Admin CAN view system information -> 200
    admin_sys = client.get("/api/admin/system", headers=admin_headers)
    assert admin_sys.status_code == 200
    assert admin_sys.json()["status"] == "operational"

    # 5. Admin CAN list users -> 200
    admin_users = client.get("/api/users", headers=admin_headers)
    assert admin_users.status_code == 200


def test_users_cannot_modify_own_or_others_roles():
    """Verify requirement #9: Users cannot modify their own roles or escalate privileges."""
    uid = uuid.uuid4().hex[:8]
    email = f"strict_role.{uid}@example.com"
    pwd = "Password123!"

    # 1. Attempt role escalation during registration
    reg_res = client.post(
        "/api/auth/register",
        json={"email": email, "password": pwd, "role": "admin"},
    )
    assert reg_res.status_code == 201
    assert reg_res.json()["user"]["role"] == "user"

    # Login to get token
    login_res = client.post("/api/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["_id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Attempt role modification via profile update
    prof_update = client.put(
        "/api/profile",
        json={"role": "admin", "age": 28},
        headers=headers,
    )
    assert prof_update.status_code == 200
    # Role remains 'user' in database
    db_user = user_repository.get_by_email(email)
    assert db_user["role"] == "user"

    # 3. Attempt direct role update endpoint -> 403
    role_ep_attempt = client.patch(
        f"/api/users/{user_id}/role",
        json={"role": "admin"},
        headers=headers,
    )
    assert role_ep_attempt.status_code == 403


def test_scheme_crud_and_archive_persistence():
    """Verify requirement #10: Scheme CRUD and archiving persist correctly."""
    uid = uuid.uuid4().hex[:8]
    admin_email = f"scheme_admin.{uid}@example.com"
    user_repository.create_user({"email": admin_email, "password_hash": "hash", "role": "admin", "profile": {}})
    admin_token = create_access_token({"sub": admin_email, "role": "admin"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    slug = f"test-scheme-crud-{uid}"
    payload = {
        "name": f"Scheme CRUD Test {uid}",
        "slug": slug,
        "description": "Comprehensive test scheme for verification",
        "category": ["education"],
        "government": {"level": "central", "department": "Education"},
        "eligibility": {"age": {"min": 18, "max": 25}},
        "benefits": ["Benefit 1"],
        "documents": ["Aadhaar"],
        "application": {"official_url": "https://gov.in"},
        "source": {"department": "Education", "source_url": "https://gov.in", "last_verified": "2026-01-01"},
        "status": "active",
    }

    # 1. Create scheme
    c_res = client.post("/api/schemes", json=payload, headers=admin_headers)
    assert c_res.status_code == 201

    # 2. Read scheme
    r_res = client.get(f"/api/schemes/{slug}")
    assert r_res.status_code == 200
    assert r_res.json()["name"] == payload["name"]

    # 3. Update scheme
    u_res = client.put(f"/api/schemes/{slug}", json={"description": "Updated desc"}, headers=admin_headers)
    assert u_res.status_code == 200

    # 4. Archive scheme (soft delete)
    d_res = client.delete(f"/api/schemes/{slug}", headers=admin_headers)
    assert d_res.status_code == 200

    # Verify status changed to archived in DB
    archived_doc = scheme_repository.get_by_slug(slug)
    assert archived_doc is not None
    assert archived_doc["status"] == "archived"

    # 5. Permanent delete
    p_res = client.delete(f"/api/schemes/{slug}?permanent=true", headers=admin_headers)
    assert p_res.status_code == 200
    assert scheme_repository.get_by_slug(slug) is None

