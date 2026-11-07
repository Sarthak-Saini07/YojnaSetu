from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from app.config import settings
from app.database import db_manager
from app.auth.deps import get_current_admin
from app.repositories.user_repository import user_repository
from app.repositories.scheme_repository import scheme_repository

router = APIRouter(prefix="/admin", tags=["Admin & System"])


class SystemStats(BaseModel):
    total_users: int
    total_admins: int
    total_schemes: int
    active_schemes: int
    archived_schemes: int


class SystemInfoResponse(BaseModel):
    status: str
    environment: str
    database_name: str
    database_status: str
    collections: List[str]
    stats: SystemStats
    timestamp: str


@router.get(
    "/system",
    response_model=SystemInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="Get System & Database Information (Admin Only)",
    description="Provides real-time MongoDB metrics, collection statistics, and operational telemetry. Requires admin privileges.",
)
def get_system_info(
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> SystemInfoResponse:
    db_health = db_manager.check_health()
    
    # Query collection names if connected
    collection_names: List[str] = []
    try:
        db = db_manager.get_database()
        collection_names = db.list_collection_names()
    except Exception:
        pass

    # Calculate real-time stats
    total_users = user_repository.count_users()
    total_admins = user_repository.count_users({"role": "admin"})
    total_schemes = scheme_repository.count()
    active_schemes = scheme_repository.count({"status": "active"})
    archived_schemes = scheme_repository.count({"status": "archived"})

    return SystemInfoResponse(
        status="operational",
        environment=settings.ENVIRONMENT,
        database_name=settings.DATABASE_NAME,
        database_status=db_health.get("status", "unknown"),
        collections=collection_names,
        stats=SystemStats(
            total_users=total_users,
            total_admins=total_admins,
            total_schemes=total_schemes,
            active_schemes=active_schemes,
            archived_schemes=archived_schemes,
        ),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

