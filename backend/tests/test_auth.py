import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.auth.security import hash_password, verify_password, create_access_token, decode_access_token

client = TestClient(app)


def test_password_hashing():
    raw_pwd = "MySecretPassword123"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_creation_and_decoding():
    data = {"sub": "citizen@example.com", "role": "user"}
    token = create_access_token(data)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded["sub"] == "citizen@example.com"
    assert decoded["role"] == "user"


import uuid


def test_auth_registration_and_login_flow():
    test_email = f"punjab.student.{uuid.uuid4().hex[:8]}@example.com"
    test_password = "SecurePassword123!"

    # 1. Register User
    reg_response = client.post(
        "/api/auth/register",
        json={
            "email": test_email,
            "password": test_password,
            "profile": {
                "age": 22,
                "gender": "male",
                "state": "Punjab",
                "annual_income": 200000,
                "occupation": "student",
                "is_student": True,
            },
        },
    )
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["message"] == "Registration successful"
    assert reg_data["user"]["email"] == test_email
    assert reg_data["user"]["profile"]["state"] == "Punjab"

    # 2. Duplicate Registration Attempt
    dup_response = client.post(
        "/api/auth/register",
        json={"email": test_email, "password": "otherpassword"},
    )
    assert dup_response.status_code == 400
    assert "already registered" in dup_response.json()["detail"].lower()

    # 3. Invalid Login
    bad_login = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": "WrongPassword"},
    )
    assert bad_login.status_code == 401

    # 4. Successful Login
    good_login = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": test_password},
    )
    assert good_login.status_code == 200
    token_data = good_login.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 5. Get Authenticated User Details (/api/auth/me)
    me_response = client.get("/api/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == test_email

    # 6. Fetch User Profile (/api/users/me)
    profile_response = client.get("/api/users/me", headers=headers)
    assert profile_response.status_code == 200
    prof = profile_response.json()
    assert prof["state"] == "Punjab"
    assert prof["age"] == 22

    # 7. Update User Profile (/api/users/me)
    update_response = client.put(
        "/api/users/me",
        headers=headers,
        json={
            "age": 23,
            "gender": "male",
            "state": "Punjab",
            "district": "Amritsar",
            "annual_income": 220000,
            "occupation": "student",
            "education": "undergraduate",
            "category": "general",
            "is_student": True,
            "is_farmer": False,
            "is_disabled": False,
        },
    )
    assert update_response.status_code == 200
    updated_prof = update_response.json()
    assert updated_prof["age"] == 23
    assert updated_prof["district"] == "Amritsar"
    assert updated_prof["annual_income"] == 220000


def test_unauthenticated_protected_route():
    response = client.get("/api/auth/me")
    assert response.status_code == 401
