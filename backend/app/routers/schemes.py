from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.schemas.scheme import SchemeCreate, SchemeUpdate, SchemeResponse
from app.services.scheme_service import scheme_service
from app.auth.deps import get_current_admin

router = APIRouter(prefix="/schemes", tags=["Schemes"])


class SchemePaginatedResponse(BaseModel):
    items: List[SchemeResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class DeleteResponse(BaseModel):
    message: str


@router.get(
    "",
    response_model=SchemePaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="List Government Schemes",
    description="List active schemes with optional search text, category, state, government level filters, and pagination.",
)
def list_schemes(
    search: Optional[str] = Query(None, description="Search text in scheme name, description, or department"),
    category: Optional[str] = Query(None, description="Filter by scheme category (e.g. education, agriculture)"),
    state: Optional[str] = Query(None, description="Filter by state eligibility (e.g. Punjab, Haryana)"),
    government_level: Optional[str] = Query(None, description="Filter by government level (central or state)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (e.g. active, archived, all)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
) -> SchemePaginatedResponse:
    res = scheme_service.list_schemes(
        search=search,
        category=category,
        state=state,
        government_level=government_level,
        status_filter=status_filter,
        page=page,
        limit=limit,
    )

    return SchemePaginatedResponse(
        items=[SchemeResponse(**item) for item in res["items"]],
        total=res["total"],
        page=res["page"],
        limit=res["limit"],
        total_pages=res["total_pages"],
    )


@router.get(
    "/{scheme_id_or_slug}",
    response_model=SchemeResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Scheme Details",
    description="Retrieve comprehensive scheme details by string ID or unique slug.",
)
def get_scheme(scheme_id_or_slug: str) -> SchemeResponse:
    doc = scheme_service.get_scheme(scheme_id_or_slug)
    return SchemeResponse(**doc)


@router.post(
    "",
    response_model=SchemeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Scheme (Admin Only)",
    description="Create a new government scheme document. Requires admin authorization.",
)
def create_scheme(
    scheme_in: SchemeCreate,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> SchemeResponse:
    created = scheme_service.create_scheme(scheme_in)
    return SchemeResponse(**created)


@router.put(
    "/{scheme_id_or_slug}",
    response_model=SchemeResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Scheme (Admin Only)",
    description="Update existing government scheme details. Requires admin authorization.",
)
def update_scheme(
    scheme_id_or_slug: str,
    scheme_update: SchemeUpdate,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> SchemeResponse:
    updated = scheme_service.update_scheme(scheme_id_or_slug, scheme_update)
    return SchemeResponse(**updated)


@router.delete(
    "/{scheme_id_or_slug}",
    response_model=DeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete Scheme (Admin Only)",
    description="Soft-delete (archive) or permanently delete a government scheme. Requires admin authorization.",
)
def delete_scheme(
    scheme_id_or_slug: str,
    permanent: bool = Query(False, description="If true, permanently delete from DB; otherwise archive"),
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> DeleteResponse:
    res = scheme_service.delete_scheme(scheme_id_or_slug, soft_delete=not permanent)
    return DeleteResponse(message=res["message"])
