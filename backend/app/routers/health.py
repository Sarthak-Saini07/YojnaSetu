from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.config import settings
from app.database import db_manager

router = APIRouter(tags=["Health"])


class DatabaseHealth(BaseModel):
    status: str
    database_name: str
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str
    database: DatabaseHealth


@router.api_route(
    "/health",
    methods=["GET", "HEAD"],
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check Endpoint",
    description="Check service health and MongoDB Atlas connection status.",
)
def get_health() -> HealthResponse:
    db_health = db_manager.check_health()
    return HealthResponse(
        status="ok",
        service="Government Scheme Recommendation System API",
        environment=settings.ENVIRONMENT,
        database=DatabaseHealth(**db_health),
    )
