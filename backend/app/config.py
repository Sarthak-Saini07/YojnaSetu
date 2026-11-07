import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Locate directories containing .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env" if (BACKEND_DIR / ".env").exists() else BASE_DIR / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "government_scheme_db"
    JWT_SECRET: str = "dev_jwt_secret_key_change_in_production"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = ""

    # Initial Admin Configuration for secure controlled setup
    ADMIN_EMAIL: str = "admin@gov.in"
    ADMIN_PASSWORD: str = "Admin@123456"

    # AI & LLM Settings (Phase 8)
    LLM_PROVIDER: str = "mock"  # "mock", "gemini", or "openai"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"
    LLM_TIMEOUT: int = 10

    model_config = SettingsConfigDict(
        env_file=[str(BACKEND_DIR / ".env"), str(BASE_DIR / ".env")],
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

