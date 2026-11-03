from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bson import ObjectId
from pymongo import ASCENDING, TEXT, IndexModel
from pymongo.database import Database

from app.database import db_manager


class SchemeRepository:
    """Repository handling all MongoDB operations for government schemes with in-memory fallback."""

    COLLECTION_NAME = "schemes"

    def __init__(self, db: Optional[Database] = None):
        self._db = db
        self._in_memory_schemes: Dict[str, Dict[str, Any]] = {}

    @property
    def collection(self):
        db = self._db or db_manager.get_database()
        return db[self.COLLECTION_NAME]

    def create_indexes(self) -> List[str]:
        """Ensure indexes for optimal scheme querying according to DATABASE.md."""
        try:
            indexes = [
                IndexModel([("slug", ASCENDING)], unique=True, name="idx_unique_slug"),
                IndexModel([("status", ASCENDING)], name="idx_status"),
                IndexModel([("category", ASCENDING)], name="idx_category"),
                IndexModel([("government.level", ASCENDING)], name="idx_gov_level"),
                IndexModel([("eligibility.states", ASCENDING)], name="idx_states"),
                IndexModel(
                    [("name", TEXT), ("description", TEXT), ("government.department", TEXT)],
                    name="idx_text_search",
                    weights={"name": 10, "government.department": 5, "description": 1},
                ),
            ]
            return self.collection.create_indexes(indexes)
        except Exception:
            return []

    def _matches_in_memory_query(self, item: Dict[str, Any], query: Dict[str, Any]) -> bool:
        status_query = query.get("status")
        item_status = item.get("status")

        if isinstance(status_query, dict):
            if "$ne" in status_query and item_status == status_query["$ne"]:
                return False
            if "$eq" in status_query and item_status != status_query["$eq"]:
                return False
        elif isinstance(status_query, str):
            if item_status != status_query:
                return False

        if "category" in query:
            target_cat = query["category"].lower()
            item_cats = [c.lower() for c in item.get("category", [])]
            if target_cat not in item_cats:
                return False

        if "government.level" in query:
            if item.get("government", {}).get("level", "").lower() != query["government.level"].lower():
                return False

        if "$and" in query:
            for cond in query["$and"]:
                if "$or" in cond:
                    or_matched = False
                    for branch in cond["$or"]:
                        if "eligibility.states" in branch:
                            req_state = branch["eligibility.states"]
                            states = item.get("eligibility", {}).get("states", [])
                            if isinstance(req_state, str) and (req_state in states or len(states) == 0):
                                or_matched = True
                                break
                            if isinstance(req_state, dict) and req_state.get("$size") == 0 and len(states) == 0:
                                or_matched = True
                                break
                        if "name" in branch:
                            term = branch["name"]["$regex"]
                            if (
                                term.lower() in item.get("name", "").lower()
                                or term.lower() in item.get("description", "").lower()
                                or term.lower() in item.get("government", {}).get("department", "").lower()
                            ):
                                or_matched = True
                                break
                    if not or_matched:
                        return False
        return True

    def upsert_scheme(self, scheme_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Insert or update scheme document matched by slug."""
        now = datetime.now(timezone.utc)
        slug = scheme_dict["slug"]

        try:
            existing = self.collection.find_one({"slug": slug})
            if existing:
                scheme_dict["updated_at"] = now
                scheme_dict["created_at"] = existing.get("created_at", now)
                update_fields = {k: v for k, v in scheme_dict.items() if k != "_id"}
                self.collection.update_one({"slug": slug}, {"$set": update_fields})
                result_doc = self.collection.find_one({"slug": slug})
            else:
                scheme_dict["created_at"] = now
                scheme_dict["updated_at"] = now
                insert_dict = scheme_dict.copy()
                if "_id" in insert_dict:
                    if isinstance(insert_dict["_id"], str) and ObjectId.is_valid(insert_dict["_id"]):
                        insert_dict["_id"] = ObjectId(insert_dict["_id"])
                    elif not isinstance(insert_dict["_id"], ObjectId):
                        insert_dict.pop("_id", None)
                insert_result = self.collection.insert_one(insert_dict)
                result_doc = self.collection.find_one({"_id": insert_result.inserted_id})

            result_doc["_id"] = str(result_doc["_id"])
            return result_doc
        except Exception:
            # Fallback for testing when database is disconnected
            if "_id" not in scheme_dict:
                scheme_dict["_id"] = str(ObjectId())
            scheme_dict["created_at"] = now
            scheme_dict["updated_at"] = now
            self._in_memory_schemes[slug] = scheme_dict
            return scheme_dict

    def get_by_id(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        """Find scheme document by string ObjectId."""
        if not ObjectId.is_valid(scheme_id):
            return None
        try:
            doc = self.collection.find_one({"_id": ObjectId(scheme_id)})
            if doc:
                doc["_id"] = str(doc["_id"])
            return doc
        except Exception:
            for s in self._in_memory_schemes.values():
                if s.get("_id") == scheme_id:
                    return s
            return None

    def get_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """Find scheme document by unique slug."""
        try:
            doc = self.collection.find_one({"slug": slug})
            if doc:
                doc["_id"] = str(doc["_id"])
            return doc
        except Exception:
            return self._in_memory_schemes.get(slug)

    def list_schemes(
        self, query: Optional[Dict[str, Any]] = None, skip: int = 0, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """List active/matching schemes with pagination."""
        try:
            filter_query = query or {}
            cursor = self.collection.find(filter_query).skip(skip).limit(limit)
            results = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                results.append(doc)
            return results
        except Exception:
            items = list(self._in_memory_schemes.values())
            if query:
                items = [item for item in items if self._matches_in_memory_query(item, query)]
            return items[skip : skip + limit]

    def count(self, query: Optional[Dict[str, Any]] = None) -> int:
        """Count schemes matching query filter."""
        try:
            return self.collection.count_documents(query or {})
        except Exception:
            items = list(self._in_memory_schemes.values())
            if query:
                items = [item for item in items if self._matches_in_memory_query(item, query)]
            return len(items)


scheme_repository = SchemeRepository()
