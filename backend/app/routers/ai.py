import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field

from app.ai import ai_service
from app.schemas.ai import ExtractedProfileResponse, NaturalLanguageProfileInput
from app.routers.eligibility import RecommendationResponse, RecommendationRequest, recommend_schemes
from app.recommendation.engine import generate_recommendations

logger = logging.getLogger("routers.ai")

router = APIRouter(prefix="/ai", tags=["AI & Profile Extraction"])


class TextToRecommendationResponse(BaseModel):
    """Pipeline response combining AI profile extraction and deterministic recommendation results."""

    extracted_profile_response: ExtractedProfileResponse
    recommendations: RecommendationResponse


@router.post(
    "/parse-profile",
    response_model=ExtractedProfileResponse,
    summary="Extract Structured Profile from Natural Language Text",
    description="Parses natural-language input (e.g. 'I am 21, live in Punjab, family income 2.5 lakh') into a Pydantic-validated UserProfile.",
)
async def parse_profile(input_data: NaturalLanguageProfileInput):
    """AI-assisted natural language profile extraction endpoint."""
    try:
        response = await ai_service.parse_profile_from_text(input_data)
        return response
    except Exception as e:
        logger.error(f"Error parsing profile from text: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI profile extraction failed: {str(e)}",
        )


@router.post(
    "/recommend-from-text",
    response_model=TextToRecommendationResponse,
    summary="Parse Profile Text & Run Deterministic Recommendations Pipeline",
    description="Passes natural-language extracted profile into the existing deterministic recommendation engine.",
)
async def recommend_from_text(input_data: NaturalLanguageProfileInput):
    """Pipeline endpoint connecting AI profile extraction directly to existing deterministic recommendation engine."""
    try:
        # 1. Extract profile via AI layer
        extraction_res = await ai_service.parse_profile_from_text(input_data)

        # 2. Evaluate using existing deterministic recommendation engine endpoint logic
        rec_request = RecommendationRequest(profile=extraction_res.extracted_profile)
        recommendation_res = recommend_schemes(rec_request)

        return TextToRecommendationResponse(
            extracted_profile_response=extraction_res,
            recommendations=recommendation_res,
        )
    except Exception as e:
        logger.error(f"Error in text-to-recommendation pipeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI recommendation pipeline failed: {str(e)}",
        )

