#!/usr/bin/env python3
"""
Comprehensive End-to-End Validation Script for Government Scheme Recommendation System.
Validates:
1. Scheme database completeness, unique slugs, required fields, and official source URLs.
2. User registration and MongoDB persistence with bcrypt password hashing (no plain text).
3. Unique email constraint in MongoDB.
4. Login, token authentication, and persistent profile retrieval.
5. Session persistence across logout and re-login without losing profile data.
6. Profile editing, immediate MongoDB persistence, and unchanged field retention.
7. Recommendation engine integration with user's saved profile (all 3 deterministic states).
8. Dynamic recommendation recalculation after profile update.
9. Security testing: unauthorized profile access prevention, password hash non-exposure.
"""

import sys
import uuid
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.database import db_manager
from app.repositories.scheme_repository import scheme_repository
from app.repositories.user_repository import user_repository

client = TestClient(app)


def run_comprehensive_validation():
    print("=" * 75)
    print("  COMPREHENSIVE VALIDATION: GOVERNMENT SCHEME RECOMMENDATION SYSTEM  ")
    print("=" * 75)

    # ---------------------------------------------------------
    # TEST 1: Scheme Database Validation
    # ---------------------------------------------------------
    print("\n[TEST 1] Validating Schemes in MongoDB...")
    total_schemes = scheme_repository.count()
    print(f" -> Total schemes in MongoDB: {total_schemes}")
    assert total_schemes >= 40, f"Expected at least 40 schemes, got {total_schemes}"

    all_schemes = scheme_repository.list_schemes(limit=500)
    slugs = set()
    for s in all_schemes:
        slug = s.get("slug")
        name = s.get("name")
        assert slug, f"Scheme {name} is missing a slug"
        assert slug not in slugs, f"Duplicate slug detected: {slug}"
        slugs.add(slug)

        assert s.get("name"), f"Scheme {slug} missing name"
        assert s.get("category"), f"Scheme {slug} missing category"
        assert s.get("government"), f"Scheme {slug} missing government info"
        assert s.get("eligibility"), f"Scheme {slug} missing eligibility"
        assert s.get("application"), f"Scheme {slug} missing application info"
        assert s.get("source"), f"Scheme {slug} missing source info"

        official_url = s["application"].get("official_url", "")
        source_url = s["source"].get("source_url", "")
        assert official_url.startswith("http"), f"Invalid official_url: {official_url} on {slug}"
        assert source_url.startswith("http"), f"Invalid source_url: {source_url} on {slug}"

    print(f" -> PASSED: {len(slugs)} schemes verified with unique slugs, valid schemas, and official URLs.")

    # ---------------------------------------------------------
    # TEST 2: User Registration & Secure MongoDB Storage
    # ---------------------------------------------------------
    print("\n[TEST 2] Testing User Registration & Password Hashing in MongoDB...")
    test_id = uuid.uuid4().hex[:6]
    test_email = f"citizen.test.{test_id}@punjab.gov.in"
    test_password = "ComplexSecurePass#2026"
    test_name = "Harmanpreet Singh"

    reg_payload = {
        "name": test_name,
        "full_name": test_name,
        "email": test_email,
        "password": test_password,
        "phone": "+919876543210",
        "profile": {
            "date_of_birth": "2001-08-25",
            "gender": "Male",
            "state": "Punjab",
            "district": "Jalandhar",
            "annual_income": 200000,
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

    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    reg_json = reg_resp.json()
    created_user = reg_json["user"]
    assert created_user["email"] == test_email
    assert created_user["name"] == test_name
    assert "password" not in created_user
    assert "password_hash" not in created_user
    assert created_user["profile"]["age"] is not None
    assert created_user["profile"]["age"] >= 24
    assert created_user["profile"]["profile_completion_percentage"] == 100
    print(" -> PASSED: User successfully registered via API with profile completion 100%.")

    # Verify directly in MongoDB
    db_user = user_repository.get_by_email(test_email)
    assert db_user is not None, "User not found in MongoDB!"
    assert db_user["password_hash"] != test_password, "CRITICAL: Password stored as plain text!"
    assert db_user["password_hash"].startswith(("$2b$", "$2a$")), "Password not hashed with bcrypt!"
    assert db_user["profile"]["district"] == "Jalandhar"
    print(" -> PASSED: Verified in MongoDB: password is securely bcrypt-hashed and profile is stored.")

    # Test Duplicate Registration
    dup_resp = client.post("/api/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400
    print(" -> PASSED: Duplicate registration with same email correctly rejected.")

    # ---------------------------------------------------------
    # TEST 3: Login & Profile Restoration
    # ---------------------------------------------------------
    print("\n[TEST 3] Testing Login & Persistent Profile Restoration...")
    login_resp = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": test_password},
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["user"]["name"] == test_name
    assert login_data["user"]["profile"]["district"] == "Jalandhar"
    assert login_data["user"]["profile"]["state"] == "Punjab"
    assert "password_hash" not in login_data["user"]
    print(" -> PASSED: Login returns user and restored profile without exposing password hash.")

    token = login_data["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # Verify /api/auth/me
    me_resp = client.get("/api/auth/me", headers=auth_headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == test_email
    assert me_resp.json()["profile"]["district"] == "Jalandhar"
    print(" -> PASSED: /api/auth/me restores profile from active session token.")

    # Verify /api/profile
    prof_resp = client.get("/api/profile", headers=auth_headers)
    assert prof_resp.status_code == 200
    assert prof_resp.json()["state"] == "Punjab"
    assert prof_resp.json()["occupation"] == "student"
    print(" -> PASSED: /api/profile successfully retrieves saved profile.")

    # ---------------------------------------------------------
    # TEST 4: Profile Editing & Immediate MongoDB Persistence
    # ---------------------------------------------------------
    print("\n[TEST 4] Testing Profile Update & Field Retention...")
    update_payload = {
        "annual_income": 350000,
        "district": "Amritsar",
        "phone": "+919988776655",
    }
    update_resp = client.put("/api/profile", headers=auth_headers, json=update_payload)
    assert update_resp.status_code == 200, f"Profile update failed: {update_resp.text}"
    updated_profile = update_resp.json()
    assert updated_profile["annual_income"] == 350000
    assert updated_profile["district"] == "Amritsar"
    # Unchanged fields MUST be preserved
    assert updated_profile["state"] == "Punjab"
    assert updated_profile["occupation"] == "student"
    assert updated_profile["category"] == "SC"
    assert updated_profile["is_student"] is True
    print(" -> PASSED: Profile updated immediately; unchanged fields were preserved.")

    # Logout
    logout_resp = client.post("/api/auth/logout", headers=auth_headers)
    assert logout_resp.status_code == 200
    print(" -> PASSED: User logged out successfully.")

    # Re-login to verify updated info is permanently restored
    re_login_resp = client.post(
        "/api/auth/login",
        json={"email": test_email, "password": test_password},
    )
    assert re_login_resp.status_code == 200
    new_user_data = re_login_resp.json()["user"]
    assert new_user_data["profile"]["annual_income"] == 350000
    assert new_user_data["profile"]["district"] == "Amritsar"
    assert new_user_data["profile"]["state"] == "Punjab"
    print(" -> PASSED: Re-login restores updated profile from MongoDB successfully.")

    new_headers = {"Authorization": f"Bearer {re_login_resp.json()['access_token']}"}

    # ---------------------------------------------------------
    # TEST 5: Recommendation Engine Integration with Saved Profile
    # ---------------------------------------------------------
    print("\n[TEST 5] Testing Deterministic Recommendations Integration...")
    rec_resp = client.get("/api/eligibility/me", headers=new_headers)
    assert rec_resp.status_code == 200, f"Recommendation check failed: {rec_resp.text}"
    rec_data = rec_resp.json()

    print(f" -> Total schemes evaluated: {rec_data['total_evaluated']}")
    print(f" -> Eligible schemes: {rec_data['eligible_count']}")
    print(f" -> Insufficient info schemes: {rec_data['insufficient_info_count']}")
    print(f" -> Ineligible schemes: {rec_data['not_eligible_count']}")

    assert rec_data["total_evaluated"] >= 40
    assert "eligible" in rec_data["grouped"]
    assert "insufficient_information" in rec_data["grouped"]
    assert "not_eligible" in rec_data["grouped"]

    eligible_slugs = [item["scheme_slug"] for item in rec_data["grouped"]["eligible"]]
    # With ₹3.5L income, student qualifies for PM Vidya Lakshmi, Central Sector Scholarship, PM-USP, etc.
    assert "pm-vidya-lakshmi" in eligible_slugs, f"Expected pm-vidya-lakshmi in eligible, got {eligible_slugs}"
    assert "pm-usp-csis" in eligible_slugs or "central-sector-scholarship-college" in eligible_slugs
    print(f" -> Sample eligible schemes for student: {eligible_slugs[:5]}")
    print(" -> PASSED: All three deterministic outcomes correctly grouped; user qualified schemes verified.")

    # ---------------------------------------------------------
    # TEST 6: Dynamic Recalculation on Profile Change
    # ---------------------------------------------------------
    print("\n[TEST 6] Testing Dynamic Recommendations Recalculation on Profile Change...")
    # Change user to farmer with 1.5L income
    client.put(
        "/api/profile",
        headers=new_headers,
        json={
            "occupation": "farmer",
            "is_farmer": True,
            "is_student": False,
            "annual_income": 150000,
            "education": "secondary",
        },
    )

    rec_resp2 = client.get("/api/eligibility/me", headers=new_headers)
    rec_data2 = rec_resp2.json()
    new_eligible_slugs = [item["scheme_slug"] for item in rec_data2["grouped"]["eligible"]]
    new_ineligible_slugs = [item["scheme_slug"] for item in rec_data2["grouped"]["not_eligible"]]

    assert "pm-kisan" in new_eligible_slugs, "PM-KISAN should now be ELIGIBLE for farmer profile"
    assert "pm-fasal-bima-yojana" in new_eligible_slugs, "PMFBY should now be ELIGIBLE for farmer profile"
    assert "post-matric-scholarship-sc" in new_ineligible_slugs, "Student scholarship should now be NOT ELIGIBLE"
    print(" -> PASSED: Modifying profile dynamically re-ranks schemes and alters eligibility outcomes.")

    # ---------------------------------------------------------
    # TEST 7: Security & Unauthorized Protection
    # ---------------------------------------------------------
    print("\n[TEST 7] Testing Security & Unauthorized Access...")
    unauth_resp1 = client.get("/api/auth/me")
    assert unauth_resp1.status_code == 401
    unauth_resp2 = client.get("/api/profile")
    assert unauth_resp2.status_code == 401
    unauth_resp3 = client.get("/api/eligibility/me")
    assert unauth_resp3.status_code == 401
    print(" -> PASSED: All protected endpoints strictly reject unauthenticated requests with HTTP 401.")

    print("\n" + "=" * 75)
    print("  ALL 7 END-TO-END VALIDATION TESTS PASSED WITH 100% SUCCESS!  ")
    print("=" * 75)
    return True


if __name__ == "__main__":
    run_comprehensive_validation()
