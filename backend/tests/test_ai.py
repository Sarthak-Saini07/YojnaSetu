import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ai.providers import MockLLMProvider, GeminiLLMProvider, get_llm_provider
from app.ai.service import AIService
from app.schemas.ai import NaturalLanguageProfileInput
from app.schemas.user import UserProfile

client = TestClient(app)


@pytest.mark.asyncio
async def test_valid_profile_extraction():
    """Test extracting full profile from standard natural language text."""
    provider = MockLLMProvider()
    text = "I'm 21 years old, live in Punjab, I'm a BTech student and my annual family income is around 2.5 lakh."
    result = await provider.parse_profile(text)

    assert result["age"] == 21
    assert result["state"] == "Punjab"
    assert result["annual_income"] == 250000.0
    assert result["occupation"] == "student"
    assert result["education"] == "undergraduate"
    assert result["is_student"] is True


@pytest.mark.asyncio
async def test_missing_fields_handling():
    """Test that missing information is NOT fabricated and remains None (Requirement #5)."""
    provider = MockLLMProvider()
    text = "I'm 21 and studying BTech in Punjab."
    result = await provider.parse_profile(text)

    assert result["age"] == 21
    assert result["state"] == "Punjab"
    assert result["education"] == "undergraduate"
    assert result["annual_income"] is None  # Income omitted, must be None


@pytest.mark.asyncio
async def test_conservative_handling_of_uncertainty():
    """Test that uncertain statements do not turn into confident values (Requirement #6)."""
    provider = MockLLMProvider()
    text = "I live in Punjab and I am a student. Income not sure about it."
    result = await provider.parse_profile(text)

    assert result["state"] == "Punjab"
    assert result["occupation"] == "student"
    assert result["annual_income"] is None


@pytest.mark.asyncio
async def test_numeric_income_parsing_variations():
    """Test parsing different income string variations (lakhs, k, rupees)."""
    provider = MockLLMProvider()

    res1 = await provider.parse_profile("Family income is 3 lakh per year")
    assert res1["annual_income"] == 300000.0

    res2 = await provider.parse_profile("Income is 50k rupees")
    assert res2["annual_income"] == 50000.0

    res3 = await provider.parse_profile("My income is ₹2,50,000 annually")
    assert res3["annual_income"] == 250000.0


@pytest.mark.asyncio
async def test_boolean_and_state_extraction():
    """Test extraction of boolean status flags and Indian states."""
    provider = MockLLMProvider()
    text = "I am a 25 year old farmer living in Haryana, also disabled person."
    result = await provider.parse_profile(text)

    assert result["age"] == 25
    assert result["state"] == "Haryana"
    assert result["occupation"] == "farmer"
    assert result["is_farmer"] is True
    assert result["is_disabled"] is True


@pytest.mark.asyncio
async def test_ai_service_privacy_sanitization():
    """Test stripping sensitive headers/tokens prior to LLM processing (Requirement #15)."""
    service = AIService(provider=MockLLMProvider())
    raw_input = "Bearer eyJhbGciOiJIUzI1Ni... I am 22 years old living in Punjab."
    sanitized = service.sanitize_text(raw_input)

    assert "Bearer" not in sanitized
    assert "eyJhbG" not in sanitized
    assert "22 years old" in sanitized


@pytest.mark.asyncio
async def test_ai_service_pydantic_validation():
    """Test post-LLM Pydantic validation nullifying invalid fields gracefully (Requirement #4)."""
    service = AIService(provider=MockLLMProvider())

    # Mock provider returning invalid negative age
    class BadLLMProvider(MockLLMProvider):
        async def parse_profile(self, text: str):
            res = await super().parse_profile(text)
            res["age"] = -50  # Invalid age
            return res

    service_bad = AIService(provider=BadLLMProvider())
    inp = NaturalLanguageProfileInput(text="I live in Punjab and my income is 2 lakh.")
    response = await service_bad.parse_profile_from_text(inp)

    assert response.extracted_profile.state == "Punjab"
    assert response.extracted_profile.annual_income == 200000.0
    assert response.extracted_profile.age is None  # Nullified negative age
    assert "Age" in response.unresolved_fields


@pytest.mark.asyncio
async def test_api_parse_profile_endpoint():
    """Test POST /api/ai/parse-profile API endpoint."""
    payload = {"text": "I am 21 years old student from Punjab with annual family income 2.5 lakh."}
    response = client.post("/api/ai/parse-profile", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "extracted_profile" in data
    assert data["extracted_profile"]["age"] == 21
    assert data["extracted_profile"]["state"] == "Punjab"
    assert data["extracted_profile"]["annual_income"] == 250000.0
    assert data["raw_text"] == payload["text"]


@pytest.mark.asyncio
async def test_api_recommend_from_text_pipeline_endpoint():
    """Test POST /api/ai/recommend-from-text pipeline connecting AI to deterministic engine (Requirement #10)."""
    payload = {"text": "I am 21 years old undergraduate student in Punjab with 250000 income."}
    response = client.post("/api/ai/recommend-from-text", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "extracted_profile_response" in data
    assert "recommendations" in data

    # Verify extracted profile
    prof = data["extracted_profile_response"]["extracted_profile"]
    assert prof["age"] == 21
    assert prof["state"] == "Punjab"

    # Verify deterministic recommendation response structure
    recs = data["recommendations"]
    assert "results" in recs
    assert "grouped" in recs
    assert "total_evaluated" in recs
    assert "eligible_count" in recs
    assert "insufficient_info_count" in recs
    assert "not_eligible_count" in recs


def test_invalid_short_input_validation():
    """Test validation rejection for empty or too short text input."""
    payload = {"text": "hi"}
    response = client.post("/api/ai/parse-profile", json=payload)
    assert response.status_code == 422  # Unprocessable Entity
