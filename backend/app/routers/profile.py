from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.schemas.user import UserProfile, UserResponse
from app.auth.deps import get_current_user
from app.repositories.user_repository import user_repository

router = APIRouter(prefix="/profile", tags=["User Profile"])


class ProfileUpdateRequest(BaseModel):
    """Flexible profile update payload supporting either flat or nested profile fields."""
    name: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile: Optional[UserProfile] = None

    # Flat demographic fields
    date_of_birth: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    annual_income: Optional[float] = Field(None, ge=0)
    occupation: Optional[str] = None
    education: Optional[str] = None
    category: Optional[str] = None
    employment_status: Optional[str] = None
    marital_status: Optional[str] = None
    family_members: Optional[int] = Field(None, ge=1, le=50)
    disability_status: Optional[str] = None
    is_student: Optional[bool] = None
    is_farmer: Optional[bool] = None
    is_disabled: Optional[bool] = None


@router.get(
    "",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Retrieves the authenticated user's demographic profile from MongoDB.",
)
@router.get(
    "/",
    response_model=UserProfile,
    include_in_schema=False,
)
def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)) -> UserProfile:
    profile_data = current_user.get("profile") or {}
    return UserProfile(**profile_data)


@router.put(
    "",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Update Current User Profile",
    description="Updates and immediately persists authenticated user's demographic profile in MongoDB.",
)
@router.put(
    "/",
    response_model=UserProfile,
    include_in_schema=False,
)
def update_profile(
    body: ProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> UserProfile:
    # If nested profile is supplied, prioritize it; otherwise gather flat fields
    if body.profile is not None:
        profile_dict = body.profile.model_dump(exclude_unset=True)
    else:
        flat_fields = {
            "date_of_birth": body.date_of_birth,
            "age": body.age,
            "gender": body.gender,
            "state": body.state,
            "district": body.district,
            "annual_income": body.annual_income,
            "occupation": body.occupation,
            "education": body.education,
            "category": body.category,
            "employment_status": body.employment_status,
            "marital_status": body.marital_status,
            "family_members": body.family_members,
            "disability_status": body.disability_status,
            "is_student": body.is_student,
            "is_farmer": body.is_farmer,
            "is_disabled": body.is_disabled,
        }
        profile_dict = {k: v for k, v in flat_fields.items() if v is not None}

    name = body.name or body.full_name
    updated_user = user_repository.update_profile(
        user_id=current_user["_id"],
        profile_dict=profile_dict,
        name=name,
        phone=body.phone,
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found",
        )
    return UserProfile(**updated_user.get("profile", {}))
