import abc
import json
import logging
import re
from typing import Any, Dict, Optional, Tuple
import httpx

from app.config import settings

logger = logging.getLogger("ai.providers")

INDIAN_STATES_LOWER = {
    "punjab": "Punjab",
    "haryana": "Haryana",
    "delhi": "Delhi",
    "maharashtra": "Maharashtra",
    "karnataka": "Karnataka",
    "tamil nadu": "Tamil Nadu",
    "uttar pradesh": "Uttar Pradesh",
    "bihar": "Bihar",
    "west bengal": "West Bengal",
    "rajasthan": "Rajasthan",
    "gujarat": "Gujarat",
    "kerala": "Kerala",
    "madhya pradesh": "Madhya Pradesh",
    "odisha": "Odisha",
    "andhra pradesh": "Andhra Pradesh",
    "telangana": "Telangana",
    "assam": "Assam",
    "himachal pradesh": "Himachal Pradesh",
    "jharkhand": "Jharkhand",
    "chhattisgarh": "Chhattisgarh",
    "uttarakhand": "Uttarakhand",
    "goa": "Goa",
    "jammu and kashmir": "Jammu and Kashmir",
    "ladakh": "Ladakh",
}


class BaseLLMProvider(abc.ABC):
    """Abstract base class for LLM providers."""

    name: str = "base"

    @abc.abstractmethod
    async def parse_profile(self, text: str) -> Dict[str, Any]:
        """Extract structured user profile fields from natural language input.

        Must return a dictionary matching UserProfile schema fields. Unmentioned or
        uncertain fields MUST be None.
        """
        pass


class MockLLMProvider(BaseLLMProvider):
    """Deterministic, rule-based mock LLM provider for unit tests, offline operation,

    and safe fallback when live LLM APIs are unavailable.
    """

    name: str = "mock"

    async def parse_profile(self, text: str) -> Dict[str, Any]:
        logger.info(f"MockLLMProvider processing text: '{text}'")
        text_lower = text.lower()

        # Check for uncertainty markers (Requirement #6: Conservative handling)
        uncertain_patterns = ["not sure", "maybe", "don't know", "approx", "doubtful"]

        profile: Dict[str, Any] = {
            "age": None,
            "gender": None,
            "state": None,
            "district": None,
            "annual_income": None,
            "occupation": None,
            "education": None,
            "category": None,
            "employment_status": None,
            "is_student": None,
            "is_farmer": None,
            "is_disabled": None,
        }

        # 1. Age Extraction
        # Look for explicit age mentions like "25 year old", "21 years old", "age 21", "21 yr", "i am 21"
        age_match = re.search(
            r"\b(?:i'm|i am|age|aged|am)\s*(\d{1,2})\b|\b(\d{1,2})\s*(?:years?|yrs?|years? old|yr old|old)\b",
            text_lower,
        )
        if age_match:
            age_val = int(age_match.group(1) or age_match.group(2))
            if 0 <= age_val <= 120:
                profile["age"] = age_val


        # 2. State Extraction
        for state_key, state_formal in INDIAN_STATES_LOWER.items():
            if re.search(r"\b" + re.escape(state_key) + r"\b", text_lower):
                profile["state"] = state_formal
                break

        # 3. Income Extraction (handles lakh, lac, k, rupees, ₹)
        # Check if income mention is uncertain e.g. "income not sure"
        is_income_uncertain = any(
            p in text_lower for p in ["income not sure", "income maybe", "unsure about income"]
        )

        if not is_income_uncertain:
            # Lakh pattern: e.g. "2.5 lakh", "2 lakh", "2.5lakhs", "2.5 lac"
            lakh_match = re.search(
                r"(\d+(?:\.\d+)?)\s*(?:lakh|lacs|lakhs|lac)\b", text_lower
            )
            if lakh_match:
                lakh_num = float(lakh_match.group(1))
                profile["annual_income"] = lakh_num * 100000.0

            # K / Thousand pattern: e.g. "50k", "50 k", "50 thousand"
            elif re.search(r"(\d+(?:\.\d+)?)\s*(?:k|thousand)\b", text_lower):
                k_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:k|thousand)\b", text_lower)
                if k_match:
                    profile["annual_income"] = float(k_match.group(1)) * 1000.0

            # Raw Currency pattern: e.g. "₹250000", "rs 250000", "250000 rupees", "2,50,000"
            else:
                curr_match = re.search(
                    r"(?:rs\.?|inr|₹|income|salary)\s*[:=]?\s*(\d[\d,]*)(?:\s*rupees)?\b",
                    text_lower,
                )
                if curr_match:
                    clean_num_str = curr_match.group(1).replace(",", "")
                    try:
                        inc_val = float(clean_num_str)
                        if inc_val >= 0:
                            profile["annual_income"] = inc_val
                    except ValueError:
                        pass

        # 4. Occupation & Student / Farmer / Disability Flags
        if any(w in text_lower for w in ["student", "studying", "btech", "b.tech", "college", "undergraduate"]):
            profile["occupation"] = "student"
            profile["is_student"] = True
        elif any(w in text_lower for w in ["farmer", "farming", "kisan", "agriculture"]):
            profile["occupation"] = "farmer"
            profile["is_farmer"] = True
        elif any(w in text_lower for w in ["employed", "salaried", "working", "job"]):
            profile["occupation"] = "employed"
            profile["employment_status"] = "employed"
        elif any(w in text_lower for w in ["unemployed", "jobless"]):
            profile["occupation"] = "unemployed"
            profile["employment_status"] = "unemployed"
        elif any(w in text_lower for w in ["self employed", "business"]):
            profile["occupation"] = "self_employed"

        # Explicit check for disabled
        if any(w in text_lower for w in ["disabled", "disability", "handicapped", "pwd"]):
            profile["is_disabled"] = True

        # 5. Education Level Extraction
        if any(w in text_lower for w in ["btech", "b.tech", "bachelor", "undergraduate", "degree", "bsc", "bca"]):
            profile["education"] = "undergraduate"
        elif any(w in text_lower for w in ["mtech", "m.tech", "master", "postgraduate", "msc", "mca"]):
            profile["education"] = "postgraduate"
        elif any(w in text_lower for w in ["12th", "higher secondary", "diploma", "inter"]):
            profile["education"] = "higher_secondary"
        elif any(w in text_lower for w in ["10th", "matric", "secondary"]):
            profile["education"] = "secondary"

        # 6. Social Category Extraction
        for cat in ["general", "obc", "sc", "st", "ews"]:
            if re.search(r"\b" + cat + r"\b", text_lower):
                profile["category"] = cat.upper() if cat != "general" else "General"
                break

        # 7. Gender Extraction
        if re.search(r"\b(?:female|woman|girl)\b", text_lower):
            profile["gender"] = "female"
        elif re.search(r"\b(?:male|man|boy)\b", text_lower):
            profile["gender"] = "male"

        return profile


class GeminiLLMProvider(BaseLLMProvider):
    """Provider integrating Google Gemini API for structured profile extraction."""

    name: str = "gemini"

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name

    async def parse_profile(self, text: str) -> Dict[str, Any]:
        if not self.api_key:
            logger.warning("Gemini API key is empty. Falling back to MockLLMProvider.")
            return await MockLLMProvider().parse_profile(text)

        prompt = f"""
You are an expert demographic data extraction engine for Indian government schemes.
Extract structured user attributes from the input text below into valid JSON.

Input text: "{text}"

Target JSON Schema format:
{{
  "age": <integer or null>,
  "gender": <"male"|"female"|"transgender" or null>,
  "state": <Indian state name e.g. "Punjab", "Haryana" or null>,
  "district": <district name or null>,
  "annual_income": <float in INR or null>,
  "occupation": <"student"|"farmer"|"employed"|"unemployed"|"self_employed" or null>,
  "education": <"primary"|"secondary"|"higher_secondary"|"undergraduate"|"postgraduate"|"doctorate" or null>,
  "category": <"General"|"OBC"|"SC"|"ST"|"EWS" or null>,
  "employment_status": <"employed"|"unemployed" or null>,
  "is_student": <boolean or null>,
  "is_farmer": <boolean or null>,
  "is_disabled": <boolean or null>
}}

STRICT EXTRACTION RULES:
1. Return ONLY raw JSON. No markdown formatting, no ```json codeblocks, no commentary.
2. If a field is not explicitly mentioned or if you are uncertain, return null. NEVER guess.
3. Convert income expressions like "2.5 lakh" to numeric 250000.
4. If text says "BTech" or "studying in college", set education to "undergraduate" and is_student to true.
"""

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
        }

        try:
            async with httpx.AsyncClient(timeout=float(settings.LLM_TIMEOUT)) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                raw_content = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                    .strip()
                )

                # Clean markdown if present
                clean_json = re.sub(r"^```json\s*|\s*```$", "", raw_content, flags=re.MULTILINE).strip()
                extracted_dict = json.loads(clean_json)
                return extracted_dict
        except Exception as e:
            logger.error(f"Gemini API extraction failed: {e}. Falling back to MockLLMProvider.")
            return await MockLLMProvider().parse_profile(text)


def get_llm_provider() -> BaseLLMProvider:
    """Factory function returning the configured LLM provider instance."""
    provider_name = settings.LLM_PROVIDER.lower().strip()

    if settings.ENVIRONMENT == "testing" or provider_name == "mock":
        return MockLLMProvider()

    if provider_name == "gemini" and settings.GEMINI_API_KEY:
        return GeminiLLMProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.LLM_MODEL)

    logger.info(f"Defaulting to MockLLMProvider (LLM_PROVIDER={provider_name})")
    return MockLLMProvider()
