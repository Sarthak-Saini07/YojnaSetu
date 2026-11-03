from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.user import UserProfile


class NaturalLanguageProfileInput(BaseModel):
    """Input payload containing raw natural-language text for profile extraction."""

    text: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Natural language statement describing user demographics (e.g. 'I am 21, live in Punjab, studying BTech')",
    )


class ExtractedProfileResponse(BaseModel):
    """Response payload containing validated structured profile extracted from text."""

    extracted_profile: UserProfile
    unresolved_fields: List[str] = Field(
        default_factory=list,
        description="Fields not mentioned or uncertain in the natural language text",
    )
    raw_text: str = Field(..., description="Original input text processed")
    extracted_fields_count: int = Field(
        ..., description="Number of profile attributes successfully extracted"
    )
    confidence_notes: str = Field(
        "", description="Transparent notes on extraction confidence and uncertainties"
    )
    ai_provider_used: str = Field(
        "mock", description="Identifier of the LLM provider used (e.g. mock, gemini, openai)"
    )
