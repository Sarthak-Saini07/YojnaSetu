from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from app.schemas.user import UserProfile
from app.auth.deps import get_current_user
from app.repositories.user_repository import user_repository

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Get Authenticated User Profile",
    description="Fetch current user's personal profile attributes used for scheme eligibility evaluation.",
)
def get_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)) -> UserProfile:
    profile_data = current_user.get("profile") or {}
    return UserProfile(**profile_data)


from app.routers.profile import ProfileUpdateRequest


@router.put(
    "/me",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Update Authenticated User Profile",
    description="Update current user's profile attributes (age, state, annual income, occupation, etc.).",
)
def update_user_profile(
    body: ProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> UserProfile:
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

