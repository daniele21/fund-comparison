from __future__ import annotations

import asyncio
import uuid
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
class ListFeedbackResult:
    items: List[Dict[str, Any]]
    next_cursor: Optional[str]


class FirestoreFeedbackRepository:
    """
    Repository for persisting and querying feedback entries in Firestore.
    """

    def __init__(
        self,
        client: Optional[firestore.Client] = None,
        collection_name: Optional[str] = None,
    ):
        if not _is_firestore_enabled():
            self._client = None
            self._collection_name = None
            self._collection = None
            return

        self._client = client or get_firestore_client()
        self._collection_name = collection_name or get_collection_name("feedbacks", "feedbacks")
        self._collection = self._client.collection(self._collection_name)

    async def create(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Persist a feedback entry and return it with its generated id."""
        if not self._collection:
            logger.warning("Firestore disabled – feedback not persisted.")
            return payload

        now = _utcnow()
        doc_id = uuid.uuid4().hex
        data = {
            **payload,
            "created_at": now,
            "status": "new",  # new | read | archived
        }

        def _write():
            doc_ref = self._collection.document(doc_id)
            doc_ref.set(data)
            return doc_ref.get()

        snapshot = await asyncio.to_thread(_write)
        logger.info("Feedback %s persisted in Firestore.", doc_id)
        return self._serialize(snapshot.id, snapshot.to_dict() or {})

    async def list(
        self,
        *,
        limit: int = 50,
        cursor: Optional[str] = None,
        status_filter: Optional[str] = None,
        feedback_type: Optional[str] = None,
    ) -> ListFeedbackResult:
        """List feedback entries with optional filters, ordered newest first."""
        if not self._collection:
            return ListFeedbackResult(items=[], next_cursor=None)

        limit = max(1, min(limit, 100))

        def _query():
            query = self._collection

            if status_filter:
                query = query.where(filter=firestore.FieldFilter("status", "==", status_filter))
            if feedback_type:
                query = query.where(filter=firestore.FieldFilter("feedback_type", "==", feedback_type))

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
        return ListFeedbackResult(items=items, next_cursor=next_cursor)

    async def update_status(self, feedback_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        """Update the status of a feedback entry (new -> read -> archived)."""
        if not self._collection:
            return None

        def _update():
            doc_ref = self._collection.document(feedback_id)
            snapshot = doc_ref.get()
            if not snapshot.exists:
                return None
            doc_ref.update({"status": new_status, "updated_at": _utcnow()})
            return doc_ref.get()

        snapshot = await asyncio.to_thread(_update)
        if snapshot is None:
            return None
        return self._serialize(snapshot.id, snapshot.to_dict() or {})

    async def delete(self, feedback_id: str) -> bool:
        """Delete a feedback entry. Returns True if deleted."""
        if not self._collection:
            return False

        def _del():
            doc_ref = self._collection.document(feedback_id)
            snapshot = doc_ref.get()
            if not snapshot.exists:
                return False
            doc_ref.delete()
            return True

        return await asyncio.to_thread(_del)

    @staticmethod
    def _serialize(doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        def _to_iso(value: Any) -> Optional[str]:
            if value is None:
                return None
            if isinstance(value, datetime):
                return value.astimezone(timezone.utc).isoformat()
            return value

        return {
            "id": doc_id,
            **{k: v for k, v in data.items() if k not in {"id"}},
            "created_at": _to_iso(data.get("created_at")),
            "updated_at": _to_iso(data.get("updated_at")),
        }


_repository: Optional[FirestoreFeedbackRepository] = None


def get_feedback_repository() -> FirestoreFeedbackRepository:
    global _repository
    if _repository is None:
        _repository = FirestoreFeedbackRepository()
    return _repository
