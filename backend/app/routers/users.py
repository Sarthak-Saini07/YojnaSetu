import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Dict, Any, Optional

from app.schemas.user import UserProfile, UserResponse, UserRoleUpdate, UserPaginatedResponse
from app.auth.deps import get_current_user, get_current_admin
from app.repositories.user_repository import user_repository

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=UserPaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="List Registered Users (Admin Only)",
    description="List all registered citizen and administrator accounts with pagination and filtering. Requires admin privileges.",
)
def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search text in user name or email"),
    role: Optional[str] = Query(None, description="Filter by user role ('user' or 'admin')"),
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> UserPaginatedResponse:
    skip = (page - 1) * limit
    users = user_repository.list_users(skip=skip, limit=limit, search=search, role=role)
    count_query = {}
    if role:
        count_query["role"] = role
    total = user_repository.count_users(query=count_query if role else None)
    total_pages = math.ceil(total / limit) if total > 0 else 1

    valid_items = []
    for u in users:
        try:
            valid_items.append(UserResponse(**u))
        except Exception:
            u_clean = dict(u)
            prof = dict(u_clean.get("profile") or {})
            if prof.get("age") is not None and (prof["age"] < 0 or prof["age"] > 120):
                prof["age"] = None
            u_clean["profile"] = prof
            try:
                valid_items.append(UserResponse(**u_clean))
            except Exception:
                pass

    return UserPaginatedResponse(
        items=valid_items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


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


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get User Details by ID (Admin Only)",
    description="Fetch complete user account details by string ID. Requires admin privileges.",
)
def get_user_by_id(
    user_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> UserResponse:
    user = user_repository.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found",
        )
    return UserResponse(**user)


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update User Role (Admin Only)",
    description="Promote or demote user account role (between 'user' and 'admin'). Requires admin privileges.",
)
def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> UserResponse:
    # Security: Prevent admin from changing their own role to prevent lockout
    if str(current_admin.get("_id")) == str(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own administrator role.",
        )

    updated = user_repository.update_user_role(user_id=user_id, new_role=role_update.role)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found",
        )
    return UserResponse(**updated)


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

