from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_standardized_error_response_format():
    """Verify that error responses have unified JSON structure with success: false and error code/message."""
    res = client.get("/api/schemes/non-existent-slug-xyz-999")
    assert res.status_code == 404
    data = res.json()
    assert data["success"] is False
    assert "error" in data
    assert "code" in data["error"]
    assert "message" in data["error"]
    assert "detail" in data


def test_validation_error_email_mapping():
    """Verify 422 invalid email yields clean error code and friendly message."""
    res = client.post("/api/auth/register", json={"email": "not-an-email", "password": "validpassword123"})
    assert res.status_code == 422
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_EMAIL"
    assert "valid email address" in data["error"]["message"].lower()


def test_validation_error_missing_fields_mapping():
    """Verify 422 missing fields yields MISSING_REQUIRED_FIELDS."""
    res = client.post("/api/auth/register", json={})
    assert res.status_code == 422
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] in ("MISSING_REQUIRED_FIELDS", "INVALID_INPUT")
    assert "required" in data["error"]["message"].lower() or "information" in data["error"]["message"].lower()


def test_login_invalid_credentials_mapping():
    """Verify 401 login failure returns INVALID_CREDENTIALS with exact friendly message."""
    res = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrongpassword123"})
    assert res.status_code == 401
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_CREDENTIALS"
    assert "invalid email or password" in data["error"]["message"].lower()
    assert "nobody@example.com" not in data["error"]["message"]

