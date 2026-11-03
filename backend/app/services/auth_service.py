from typing import Dict, Any
from fastapi import HTTPException, status

from app.schemas.user import UserCreate, UserProfile
from app.auth.security import hash_password, verify_password, create_access_token
from app.repositories.user_repository import user_repository


class AuthService:
    """Service encapsulating user registration, authentication, and token generation."""

    def register_user(self, user_create: UserCreate) -> Dict[str, Any]:
        """Register a new user account."""
        email = user_create.email.lower().strip()
        existing = user_repository.get_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered",
            )

        hashed = hash_password(user_create.password)
        name = getattr(user_create, "name", None) or getattr(user_create, "full_name", None) or ""
        phone = getattr(user_create, "phone", None)
        profile_dict = user_create.profile.model_dump() if user_create.profile else UserProfile().model_dump()

        user_dict = {
            "name": name,
            "full_name": name,
            "email": email,
            "phone": phone,
            "password_hash": hashed,
            "role": getattr(user_create, "role", "user") or "user",
            "profile": profile_dict,
        }

        created = user_repository.create_user(user_dict)
        return created

    def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user credentials."""
        email = email.lower().strip()
        user = user_repository.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user and issue JWT access token."""
        user = self.authenticate_user(email, password)
        token = create_access_token(data={"sub": user["email"], "role": user["role"]})
        name = user.get("name") or user.get("full_name") or ""
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "_id": str(user["_id"]),
                "name": name,
                "full_name": name,
                "email": user["email"],
                "phone": user.get("phone"),
                "role": user["role"],
                "profile": user.get("profile", {}),
                "created_at": user.get("created_at"),
                "updated_at": user.get("updated_at"),
            },
        }


auth_service = AuthService()
