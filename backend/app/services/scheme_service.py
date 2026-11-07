import math
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status

from app.repositories.scheme_repository import scheme_repository
from app.schemas.scheme import SchemeCreate, SchemeUpdate


class SchemeService:
    """Service managing scheme retrieval, search, filtering, and CRUD operations."""

    def list_schemes(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        state: Optional[str] = None,
        government_level: Optional[str] = None,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """List schemes with search, category/state/status filters, and pagination."""
        page = max(1, page)
        limit = max(1, min(100, limit))
        skip = (page - 1) * limit

        query: Dict[str, Any] = {}
        if status_filter and status_filter.strip():
            sf = status_filter.strip().lower()
            if sf == "archived":
                query["status"] = "archived"
            elif sf == "active":
                query["status"] = "active"
            elif sf == "all":
                pass  # include all statuses
            else:
                query["status"] = sf
        else:
            query["status"] = {"$ne": "archived"}


        and_conditions = []

        if search and search.strip():
            term = search.strip()
            and_conditions.append({
                "$or": [
                    {"name": {"$regex": term, "$options": "i"}},
                    {"description": {"$regex": term, "$options": "i"}},
                    {"government.department": {"$regex": term, "$options": "i"}},
                    {"category": {"$regex": term, "$options": "i"}},
                ]
            })

        if category and category.strip():
            query["category"] = category.strip().lower()

        if state and state.strip():
            state_term = state.strip()
            and_conditions.append({
                "$or": [
                    {"eligibility.states": state_term},
                    {"eligibility.states": {"$size": 0}},
                ]
            })

        if government_level and government_level.strip():
            query["government.level"] = government_level.strip().lower()

        if and_conditions:
            query["$and"] = and_conditions

        items = scheme_repository.list_schemes(query=query, skip=skip, limit=limit)
        total_count = scheme_repository.count(query=query)
        total_pages = math.ceil(total_count / limit) if total_count > 0 else 1

        return {
            "items": items,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    def get_scheme(self, scheme_id_or_slug: str) -> Dict[str, Any]:
        """Get scheme by ID or slug."""
        doc = scheme_repository.get_by_slug(scheme_id_or_slug)
        if not doc:
            doc = scheme_repository.get_by_id(scheme_id_or_slug)

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scheme '{scheme_id_or_slug}' not found",
            )
        return doc

    def create_scheme(self, scheme_in: SchemeCreate) -> Dict[str, Any]:
        """Create a new scheme (Admin only)."""
        existing = scheme_repository.get_by_slug(scheme_in.slug)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Scheme with slug '{scheme_in.slug}' already exists",
            )

        scheme_dict = scheme_in.model_dump()
        created = scheme_repository.upsert_scheme(scheme_dict)
        return created

    def update_scheme(
        self, scheme_id_or_slug: str, scheme_update: SchemeUpdate
    ) -> Dict[str, Any]:
        """Update an existing scheme (Admin only)."""
        existing = self.get_scheme(scheme_id_or_slug)
        update_data = scheme_update.model_dump(exclude_unset=True)

        if not update_data:
            return existing

        merged = existing.copy()
        merged.update(update_data)

        updated = scheme_repository.upsert_scheme(merged)
        return updated

    def delete_scheme(
        self, scheme_id_or_slug: str, soft_delete: bool = True
    ) -> Dict[str, Any]:
        """Soft delete (archive) or delete a scheme (Admin only)."""
        existing = self.get_scheme(scheme_id_or_slug)

        scheme_repository.delete_scheme(scheme_id_or_slug, hard_delete=not soft_delete)
        if soft_delete:
            return {"message": f"Scheme '{existing['name']}' archived successfully"}
        else:
            return {"message": f"Scheme '{existing['name']}' deleted successfully"}


scheme_service = SchemeService()
