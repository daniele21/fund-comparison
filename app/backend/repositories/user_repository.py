from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import os
import logging

from google.cloud import firestore

from backend.providers.firestore import get_collection_name, get_firestore_client

logger = logging.getLogger(__name__)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _is_firestore_enabled() -> bool:
    """Check if Firestore is enabled via environment variable."""
    return os.getenv("APP_FIRESTORE_ENABLED", "true").lower() in ("true", "1", "yes")


@dataclass
class ListUsersResult:
    items: List[Dict[str, Any]]
    next_cursor: Optional[str]


class FirestoreUserRepository:
    """
    Thin repository around the `users` collection in Firestore.

    The repository intentionally works with plain dicts; higher layers (services)
    handle Pydantic models so this stays framework agnostic.
    """

    def __init__(self, client: Optional[firestore.Client] = None, collection_name: Optional[str] = None):
        if not _is_firestore_enabled():
            # Don't initialize Firestore client if disabled
            self._client = None
            self._collection_name = None
            self._collection = None
            return
            
        self._client = client or get_firestore_client()
        self._collection_name = collection_name or get_collection_name("users", "users")
        self._collection = self._client.collection(self._collection_name)

    async def get(self, user_id: str) -> Optional[Dict[str, Any]]:
        logger.debug(f"Getting user {user_id} from Firestore")
        snapshot = await asyncio.to_thread(lambda: self._collection.document(user_id).get())
        data = snapshot.to_dict()
        if not data:
            logger.debug(f"User {user_id} not found")
            return None
        logger.debug(f"User {user_id} found")
        return self._serialize(snapshot.id, data)

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        logger.debug(f"Getting user by email {email}")
        def _query():
            return list(
                self._collection.where("email", "==", email.lower()).limit(1).stream()
            )

        results = await asyncio.to_thread(_query)
        if not results:
            logger.debug(f"User with email {email} not found")
            return None
        snap = results[0]
        logger.debug(f"User with email {email} found")
        return self._serialize(snap.id, snap.to_dict())

    async def upsert(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create or update a user profile. Automatically sets created/updated timestamps.
        """
        logger.info(f"Upserting user {user_id} in Firestore")
        now = _utcnow()

        def _write():
            logger.debug(f"Writing user {user_id} to Firestore (in thread)")
            doc_ref = self._collection.document(user_id)
            snapshot = doc_ref.get()
            existing = snapshot.to_dict() or {}
            logger.debug(f"Existing data fetched for user {user_id}")

            created_at = existing.get("created_at") or now

            # Normalise email for consistent querying
            if "email" in payload:
                payload["email"] = payload["email"].lower()

            updated = {
                **existing,
                **payload,
                "created_at": created_at,
                "updated_at": now,
            }
            plan = updated.get("plan")
            if not plan:
                updated["plan"] = "free"
            else:
                updated["plan"] = str(plan).lower()
            if payload.get("last_login_at"):
                updated["last_login_at"] = payload["last_login_at"]
            elif not existing.get("last_login_at"):
                updated["last_login_at"] = now

            logger.debug(f"Setting document for user {user_id}")
            doc_ref.set(updated, merge=True)
            logger.debug(f"Document set, reading back for user {user_id}")
            return doc_ref.get()

        logger.debug(f"About to run _write in thread for user {user_id}")
        snapshot = await asyncio.to_thread(_write)
        logger.info(f"User {user_id} upserted successfully")
        return self._serialize(snapshot.id, snapshot.to_dict() or {})

    async def list(self, *, limit: int = 25, cursor: Optional[str] = None, status: Optional[str] = None) -> ListUsersResult:
        """
        List users with optional filtering by status.
        
        Args:
            limit: Maximum number of users to return
            cursor: Pagination cursor (user_id to start after)
            status: Optional status filter (pending, active, suspended, rejected)
        """
        limit = max(1, min(limit, 100))

        def _query():
            # Start with the collection reference
            query = self._collection
            
            # Add status filter if provided (must come before order_by for composite index)
            if status:
                query = query.where(filter=firestore.FieldFilter("status", "==", status.lower()))
            
            # Then order by created_at
            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            
            query = query.limit(limit)
            
            if cursor:
                cursor_ref = self._collection.document(cursor).get()
                if cursor_ref.exists:
                    query = query.start_after(cursor_ref)
            return list(query.stream())

        snapshots = await asyncio.to_thread(_query)
        items = [self._serialize(s.id, s.to_dict() or {}) for s in snapshots]
        next_cursor = snapshots[-1].id if snapshots and len(snapshots) == limit else None
        return ListUsersResult(items=items, next_cursor=next_cursor)

    async def list_pending_users(self, *, limit: int = 25) -> ListUsersResult:
        """Get all users with pending status (awaiting admin approval)."""
        limit = max(1, min(limit, 100))

        def _query():
            query = self._collection.where(
                filter=firestore.FieldFilter("status", "==", "pending")
            ).limit(limit)
            return list(query.stream())

        snapshots = await asyncio.to_thread(_query)
        items = [self._serialize(s.id, s.to_dict() or {}) for s in snapshots]
        items.sort(key=lambda item: item.get("created_at") or "", reverse=True)
        next_cursor = snapshots[-1].id if snapshots and len(snapshots) == limit else None
        return ListUsersResult(items=items, next_cursor=next_cursor)

    async def delete(self, user_id: str) -> None:
        await asyncio.to_thread(lambda: self._collection.document(user_id).delete())

    @staticmethod
    def _serialize(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert raw Firestore data into serializable dict with ISO timestamps.
        """
        def _to_iso(value: Any) -> Optional[str]:
            if value is None:
                return None
            if isinstance(value, datetime):
                return value.astimezone(timezone.utc).isoformat()
            return value

        return {
            "id": user_id,
            **{k: v for k, v in data.items() if k not in {"id"}},
            "created_at": _to_iso(data.get("created_at")),
            "updated_at": _to_iso(data.get("updated_at")),
            "last_login_at": _to_iso(data.get("last_login_at")),
        }


_repository: Optional[FirestoreUserRepository] = None


def get_user_repository() -> FirestoreUserRepository:
    global _repository
    if _repository is None:
        _repository = FirestoreUserRepository()
    return _repository
