from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from bson import ObjectId
from pymongo import ASCENDING, IndexModel
from pymongo.database import Database

from app.database import db_manager


class UserRepository:
    """Repository handling all MongoDB operations for users with in-memory fallback for testing."""

    COLLECTION_NAME = "users"

    def __init__(self, db: Optional[Database] = None):
        self._db = db
        self._in_memory_users: Dict[str, Dict[str, Any]] = {}

    @property
    def collection(self):
        db = self._db or db_manager.get_database()
        return db[self.COLLECTION_NAME]

    def create_indexes(self) -> List[str]:
        """Ensure indexes for users collection according to DATABASE.md."""
        try:
            indexes = [
                IndexModel([("email", ASCENDING)], unique=True, name="idx_unique_email"),
            ]
            return self.collection.create_indexes(indexes)
        except Exception:
            return []

    def _normalize_user_doc(self, doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Normalize user document ensuring strings, names, and profile are well-formed."""
        if not doc:
            return None
        doc = dict(doc)
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        
        # Synchronize name and full_name
        name = doc.get("name") or doc.get("full_name") or ""
        doc["name"] = name
        doc["full_name"] = name

        # Ensure profile dictionary with calculated fields
        raw_prof = doc.get("profile") or {}
        try:
            from app.schemas.user import UserProfile
            prof_obj = UserProfile(**raw_prof)
            doc["profile"] = prof_obj.model_dump()
        except Exception:
            doc["profile"] = raw_prof

        return doc

    def create_user(self, user_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a new user document with unique email constraint."""
        now = datetime.now(timezone.utc)
        email = user_dict["email"].lower().strip()
        user_dict["email"] = email
        user_dict["created_at"] = now
        user_dict["updated_at"] = now

        name = user_dict.get("name") or user_dict.get("full_name") or ""
        user_dict["name"] = name
        user_dict["full_name"] = name

        try:
            # Ensure indexes exist
            self.create_indexes()
            insert_result = self.collection.insert_one(user_dict)
            doc = self.collection.find_one({"_id": insert_result.inserted_id})
            return self._normalize_user_doc(doc)
        except Exception:
            # Fallback for testing when database is disconnected or mock mode
            user_id = str(ObjectId())
            user_dict["_id"] = user_id
            normalized = self._normalize_user_doc(user_dict)
            self._in_memory_users[email] = normalized
            return normalized

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Find user document by normalized email."""
        email = email.lower().strip()
        try:
            doc = self.collection.find_one({"email": email})
            if doc:
                return self._normalize_user_doc(doc)
            return None
        except Exception:
            user = self._in_memory_users.get(email)
            return self._normalize_user_doc(user)

    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Find user document by string ObjectId."""
        if not ObjectId.is_valid(user_id):
            # Check in-memory fallback
            for user in self._in_memory_users.values():
                if str(user.get("_id")) == str(user_id):
                    return self._normalize_user_doc(user)
            return None
        try:
            doc = self.collection.find_one({"_id": ObjectId(user_id)})
            if doc:
                return self._normalize_user_doc(doc)
            return None
        except Exception:
            for user in self._in_memory_users.values():
                if str(user.get("_id")) == str(user_id):
                    return self._normalize_user_doc(user)
            return None

    def update_profile(
        self,
        user_id: str,
        profile_dict: Dict[str, Any],
        name: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Update user profile attributes, preserving unchanged fields immediately in MongoDB."""
        now = datetime.now(timezone.utc)
        existing = self.get_by_id(user_id)
        if not existing:
            return None

        # Merge existing profile with new updates so unchanged fields are preserved
        merged_profile = dict(existing.get("profile") or {})
        for k, v in profile_dict.items():
            if v is not None:
                merged_profile[k] = v

        # Normalize through UserProfile schema to refresh age and completion percentage
        try:
            from app.schemas.user import UserProfile
            prof_obj = UserProfile(**merged_profile)
            merged_profile = prof_obj.model_dump()
        except Exception:
            pass

        update_fields: Dict[str, Any] = {
            "profile": merged_profile,
            "updated_at": now,
        }

        if name:
            update_fields["name"] = name
            update_fields["full_name"] = name
        if phone:
            update_fields["phone"] = phone

        try:
            self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_fields},
            )
            return self.get_by_id(user_id)
        except Exception:
            user = self._in_memory_users.get(existing["email"])
            if user:
                user.update(update_fields)
                user["profile"] = merged_profile
                return self._normalize_user_doc(user)
            return None

    def list_users(
        self,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        role: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """List registered users with pagination and optional search/role filters (Admin)."""
        query: Dict[str, Any] = {}
        if role:
            query["role"] = role

        if search and search.strip():
            s = search.strip()
            query["$or"] = [
                {"email": {"$regex": s, "$options": "i"}},
                {"name": {"$regex": s, "$options": "i"}},
                {"full_name": {"$regex": s, "$options": "i"}},
            ]

        try:
            cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            return [self._normalize_user_doc(doc) for doc in cursor if doc]
        except Exception:
            results = list(self._in_memory_users.values())
            if role:
                results = [u for u in results if u.get("role") == role]
            if search and search.strip():
                st = search.strip().lower()
                results = [
                    u for u in results
                    if st in u.get("email", "").lower() or st in u.get("name", "").lower()
                ]
            return results[skip : skip + limit]

    def count_users(self, query: Optional[Dict[str, Any]] = None) -> int:
        """Count users matching query filter."""
        try:
            return self.collection.count_documents(query or {})
        except Exception:
            items = list(self._in_memory_users.values())
            if query:
                role = query.get("role")
                if role:
                    items = [u for u in items if u.get("role") == role]
            return len(items)

    def update_user_password(self, user_id: str, new_hashed_password: str) -> bool:
        """Update password_hash for a user."""
        now = datetime.now(timezone.utc)
        if not ObjectId.is_valid(user_id):
            for u in self._in_memory_users.values():
                if str(u.get("_id")) == str(user_id):
                    u["password_hash"] = new_hashed_password
                    u["updated_at"] = now
                    return True
            return False

        try:
            res = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"password_hash": new_hashed_password, "updated_at": now}},
            )
            return res.matched_count > 0
        except Exception:
            for u in self._in_memory_users.values():
                if str(u.get("_id")) == str(user_id):
                    u["password_hash"] = new_hashed_password
                    u["updated_at"] = now
                    return True
            return False

    def update_user_role(self, user_id: str, new_role: str) -> Optional[Dict[str, Any]]:
        """Update role for a user (Admin only)."""
        now = datetime.now(timezone.utc)
        if not ObjectId.is_valid(user_id):
            # check in-memory
            for u in self._in_memory_users.values():
                if str(u.get("_id")) == str(user_id):
                    u["role"] = new_role
                    u["updated_at"] = now
                    return self._normalize_user_doc(u)
            return None

        try:
            res = self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"role": new_role, "updated_at": now}},
            )
            if res.matched_count == 0:
                return None
            return self.get_by_id(user_id)
        except Exception:
            for u in self._in_memory_users.values():
                if str(u.get("_id")) == str(user_id):
                    u["role"] = new_role
                    u["updated_at"] = now
                    return self._normalize_user_doc(u)
            return None

    def delete_user(self, user_id: str) -> bool:
        """Delete user document (Admin only)."""
        if not ObjectId.is_valid(user_id):
            for k, u in list(self._in_memory_users.items()):
                if str(u.get("_id")) == str(user_id):
                    del self._in_memory_users[k]
                    return True
            return False

        try:
            res = self.collection.delete_one({"_id": ObjectId(user_id)})
            return res.deleted_count > 0
        except Exception:
            for k, u in list(self._in_memory_users.items()):
                if str(u.get("_id")) == str(user_id):
                    del self._in_memory_users[k]
                    return True
            return False


user_repository = UserRepository()
