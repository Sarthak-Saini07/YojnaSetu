from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Dict, Any

from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import auth_service
from app.auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterResponse(BaseModel):
    message: str = "Registration successful"
    user: UserResponse


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User Account",
    description="Register a new citizen account with email, password, and optional profile.",
)
def register(user_in: UserCreate) -> RegisterResponse:
    # Strict RBAC: Force role='user' on public registration to prevent privilege escalation
    user_in.role = "user"
    created_user = auth_service.register_user(user_in, force_user_role=True)
    return RegisterResponse(
        message="Registration successful",
        user=UserResponse(**created_user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticate user email and password, returning JWT Bearer access token.",
)
def login(login_in: LoginRequest) -> TokenResponse:
    login_result = auth_service.login_user(login_in.email, login_in.password)
    return TokenResponse(
        access_token=login_result["access_token"],
        token_type=login_result["token_type"],
        user=UserResponse(**login_result["user"]),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Authenticated User Details",
    description="Returns current authenticated user details from JWT token.",
)
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)) -> UserResponse:
    return UserResponse(**current_user)


class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="User Logout",
    description="Logout user and confirm session invalidation.",
)
def logout() -> LogoutResponse:
    return LogoutResponse(message="Logged out successfully")

