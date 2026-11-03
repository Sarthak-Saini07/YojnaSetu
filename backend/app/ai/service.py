import logging
import re
from typing import List, Tuple
from pydantic import ValidationError

from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.schemas.ai import ExtractedProfileResponse, NaturalLanguageProfileInput
from app.schemas.user import UserProfile

logger = logging.getLogger("ai.service")

# List of sensitive terms to strip for user privacy (Requirement #15)
SENSITIVE_PATTERNS = [
    r"bearer\s+[A-Za-z0-9\-\._~\+\/]+=*",
    r"password\s*[:=]\s*\S+",
    r"secret\s*[:=]\s*\S+",
]


class AIService:
    """Service orchestrating AI natural-language profile extraction, privacy sanitization,

    and strict post-LLM Pydantic validation.
    """

    def __init__(self, provider: BaseLLMProvider = None):
        self.provider = provider or get_llm_provider()

    def sanitize_text(self, text: str) -> str:
        """Strip sensitive credentials or authorization headers from raw text prior to processing."""
        clean_text = text
        for pat in SENSITIVE_PATTERNS:
            clean_text = re.sub(pat, "[REDACTED]", clean_text, flags=re.IGNORECASE)
        return clean_text.strip()

    async def parse_profile_from_text(
        self, input_data: NaturalLanguageProfileInput
    ) -> ExtractedProfileResponse:
        clean_text = self.sanitize_text(input_data.text)
        logger.info(f"AIService parsing profile using provider '{self.provider.name}'")

        # 1. Invoke LLM provider
        raw_dict = await self.provider.parse_profile(clean_text)

        # 2. Strict Post-LLM Pydantic Validation (Requirement #4)
        validated_profile, validation_notes = self._validate_and_sanitize_dict(raw_dict)

        # 3. Compute unresolved fields list (Requirement #5 & #6)
        unresolved_fields, extracted_count = self._compute_unresolved_fields(validated_profile)

        confidence_notes = (
            f"Successfully extracted {extracted_count} profile attributes. "
            f"Unresolved demographic fields: {', '.join(unresolved_fields) if unresolved_fields else 'None'}."
        )
        if validation_notes:
            confidence_notes += f" Note: {validation_notes}"

        return ExtractedProfileResponse(
            extracted_profile=validated_profile,
            unresolved_fields=unresolved_fields,
            raw_text=clean_text,
            extracted_fields_count=extracted_count,
            confidence_notes=confidence_notes,
            ai_provider_used=self.provider.name,
        )

    def _validate_and_sanitize_dict(self, raw_dict: dict) -> Tuple[UserProfile, str]:
        """Validate raw dictionary from LLM against Pydantic UserProfile model.

        If specific fields fail schema constraints (e.g. invalid bounds), nullify them
        conservatively instead of failing the request.
        """
        notes = []
        clean_data = {}

        for key in UserProfile.model_fields.keys():
            clean_data[key] = raw_dict.get(key)

        try:
            profile = UserProfile(**clean_data)
            return profile, ""
        except ValidationError as ve:
            logger.warning(f"Pydantic validation caught invalid LLM fields: {ve}. Nullifying invalid fields.")
            # Nullify failing fields individually
            for error in ve.errors():
                loc_field = error["loc"][0]
                if loc_field in clean_data:
                    clean_data[str(loc_field)] = None
                    notes.append(f"Nullified invalid field '{loc_field}'")
            
            profile = UserProfile(**clean_data)
            return profile, "; ".join(notes)

    def _compute_unresolved_fields(self, profile: UserProfile) -> Tuple[List[str], int]:
        """Identify missing demographic fields and count populated attributes."""
        core_fields = {
            "age": "Age",
            "state": "State Residency",
            "annual_income": "Annual Income",
            "occupation": "Occupation",
            "education": "Highest Education",
            "category": "Social Category",
        }

        unresolved = []
        extracted_count = 0

        # Check all model fields
        for field_name in UserProfile.model_fields.keys():
            val = getattr(profile, field_name)
            if val is not None:
                extracted_count += 1


        # Determine core missing fields
        for field_key, field_label in core_fields.items():
            if getattr(profile, field_key) is None:
                unresolved.append(field_label)

        return unresolved, extracted_count


ai_service = AIService()
