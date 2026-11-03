from fastapi import APIRouter, status, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.schemas.user import UserProfile
from app.schemas.scheme import SchemeResponse
from app.services.scheme_service import scheme_service
from app.eligibility.engine import evaluate_scheme
from app.recommendation.engine import generate_recommendations
from app.auth.deps import get_current_user

router = APIRouter(prefix="/eligibility", tags=["Eligibility & Recommendation Engine"])


class EligibilityCheckRequest(BaseModel):
    profile: UserProfile
    scheme_id: str = Field(..., description="Scheme ObjectId or unique slug")


class EvaluationDetail(BaseModel):
    field: str
    status: str
    message: str


class EligibilityCheckResponse(BaseModel):
    scheme_id: str
    scheme_slug: str
    scheme_name: str
    status: str = Field(..., description="ELIGIBLE, NOT ELIGIBLE, or INSUFFICIENT INFORMATION")
    eligible: bool
    is_insufficient_info: bool
    match_score: Optional[int] = Field(None, ge=0, le=100, description="Deterministic match score, or None for INSUFFICIENT INFORMATION")
    matched_conditions: List[str]
    failed_conditions: List[str]
    missing_information: List[str]
    evaluation_details: List[EvaluationDetail]


class RecommendationRequest(BaseModel):
    profile: UserProfile
    categories: Optional[List[str]] = Field(None, description="Preferred scheme categories to boost relevance")
    limit: int = Field(50, ge=1, le=100, description="Maximum recommendations to return")


class AuthenticatedRecommendationRequest(BaseModel):
    categories: Optional[List[str]] = Field(None, description="Preferred scheme categories to boost relevance")
    limit: int = Field(50, ge=1, le=100, description="Maximum recommendations to return")


class RecommendationItem(BaseModel):
    rank: int = Field(..., ge=1, description="1-based recommendation priority rank")
    scheme: SchemeResponse
    scheme_id: str
    scheme_slug: str
    scheme_name: str
    status: str = Field(..., description="ELIGIBLE, NOT ELIGIBLE, or INSUFFICIENT INFORMATION")
    eligible: bool
    is_insufficient_info: bool
    match_score: Optional[int] = Field(None, ge=0, le=100)
    recommendation_reason: str = Field(..., description="Human-readable explanation for recommendation position")
    matched_conditions: List[str]
    failed_conditions: List[str]
    missing_information: List[str]
    evaluation_details: List[EvaluationDetail]


class GroupedRecommendations(BaseModel):
    eligible: List[RecommendationItem]
    insufficient_information: List[RecommendationItem]
    not_eligible: List[RecommendationItem]


class RecommendationResponse(BaseModel):
    total_evaluated: int
    eligible_count: int
    insufficient_info_count: int
    not_eligible_count: int
    results: List[RecommendationItem]
    grouped: GroupedRecommendations


def _build_recommendation_response(res: Dict[str, Any]) -> RecommendationResponse:
    """Format recommendation engine dict into RecommendationResponse model."""
    results_formatted = []
    for item in res["results"]:
        results_formatted.append({
            "rank": item["rank"],
            "scheme": SchemeResponse(**item["scheme"]),
            "scheme_id": item["scheme_id"],
            "scheme_slug": item["scheme_slug"],
            "scheme_name": item["scheme_name"],
            "status": item["status"],
            "eligible": item["eligible"],
            "is_insufficient_info": item["is_insufficient_info"],
            "match_score": item["match_score"],
            "recommendation_reason": item["recommendation_reason"],
            "matched_conditions": item["matched_conditions"],
            "failed_conditions": item["failed_conditions"],
            "missing_information": item["missing_information"],
            "evaluation_details": [EvaluationDetail(**d) for d in item["evaluation_details"]],
        })

    grouped_formatted = {
        "eligible": [r for r in results_formatted if r["status"] == "ELIGIBLE"],
        "insufficient_information": [r for r in results_formatted if r["status"] == "INSUFFICIENT INFORMATION"],
        "not_eligible": [r for r in results_formatted if r["status"] == "NOT ELIGIBLE"],
    }

    return RecommendationResponse(
        total_evaluated=res["total_evaluated"],
        eligible_count=res["eligible_count"],
        insufficient_info_count=res["insufficient_info_count"],
        not_eligible_count=res["not_eligible_count"],
        results=results_formatted,
        grouped=GroupedRecommendations(**grouped_formatted),
    )


@router.post(
    "/check",
    response_model=EligibilityCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Check Scheme Eligibility",
    description="Deterministically evaluate user profile against specified government scheme rules. Produces ELIGIBLE, NOT ELIGIBLE, or INSUFFICIENT INFORMATION outcome.",
)
def check_eligibility(req: EligibilityCheckRequest) -> EligibilityCheckResponse:
    scheme = scheme_service.get_scheme(req.scheme_id)
    res = evaluate_scheme(req.profile, scheme)
    return EligibilityCheckResponse(**res)


@router.post(
    "/recommend",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Scheme Recommendations",
    description="Evaluates user profile against candidate schemes and returns deterministic, multi-tier ranked recommendations grouped by status.",
)
def recommend_schemes(req: RecommendationRequest) -> RecommendationResponse:
    res = generate_recommendations(
        profile=req.profile,
        preferred_categories=req.categories,
        limit=req.limit,
    )
    return _build_recommendation_response(res)


@router.get(
    "/me",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Recommendations for Authenticated User",
    description="Evaluates authenticated user's persistent profile stored in MongoDB against all active schemes and returns deterministic recommendations.",
)
def recommend_for_current_user(
    current_user: Dict[str, Any] = Depends(get_current_user),
    limit: int = 50,
) -> RecommendationResponse:
    raw_profile = current_user.get("profile") or {}
    user_prof = UserProfile(**raw_profile)
    res = generate_recommendations(
        profile=user_prof,
        limit=limit,
    )
    return _build_recommendation_response(res)


@router.post(
    "/me",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Filtered Recommendations for Authenticated User",
    description="Evaluates authenticated user's persistent MongoDB profile with optional category filtering.",
)
def recommend_for_current_user_filtered(
    req: AuthenticatedRecommendationRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> RecommendationResponse:
    raw_profile = current_user.get("profile") or {}
    user_prof = UserProfile(**raw_profile)
    res = generate_recommendations(
        profile=user_prof,
        preferred_categories=req.categories,
        limit=req.limit,
    )
    return _build_recommendation_response(res)

