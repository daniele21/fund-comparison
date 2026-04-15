"""
Admin Feedback Routes

Endpoints for administrators to view and manage user feedback.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.auth.deps import require_roles
from backend.auth.models import AuthClaims
from backend.repositories.feedback_repository import get_feedback_repository
from backend.schemas.feedback import (
    FeedbackEntry,
    FeedbackListResponse,
    FeedbackStatusUpdate,
)

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/admin/feedbacks", tags=["admin", "feedback"])


@router.get("", response_model=FeedbackListResponse)
async def list_feedbacks(
    limit: int = Query(default=50, ge=1, le=100),
    cursor: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    feedback_type: Optional[str] = Query(default=None, alias="type"),
    claims: AuthClaims = Depends(require_roles("admin")),
):
    """
    List all feedback entries with optional filtering and pagination.
    Admin-only endpoint.
    """
    try:
        repo = get_feedback_repository()
        result = await repo.list(
            limit=limit,
            cursor=cursor,
            status_filter=status_filter,
            feedback_type=feedback_type,
        )
        return FeedbackListResponse(
            items=[FeedbackEntry(**item) for item in result.items],
            next_cursor=result.next_cursor,
        )
    except Exception as e:
        logger.error(f"Error listing feedbacks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedbacks",
        )


@router.patch("/{feedback_id}/status", response_model=FeedbackEntry)
async def update_feedback_status(
    feedback_id: str,
    body: FeedbackStatusUpdate,
    claims: AuthClaims = Depends(require_roles("admin")),
):
    """
    Update the status of a feedback entry (new -> read -> archived).
    Admin-only endpoint.
    """
    try:
        repo = get_feedback_repository()
        updated = await repo.update_status(feedback_id, body.status)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Feedback {feedback_id} not found",
            )
        return FeedbackEntry(**updated)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating feedback {feedback_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update feedback status",
        )


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: str,
    claims: AuthClaims = Depends(require_roles("admin")),
):
    """
    Delete a feedback entry permanently.
    Admin-only endpoint.
    """
    try:
        repo = get_feedback_repository()
        deleted = await repo.delete(feedback_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Feedback {feedback_id} not found",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting feedback {feedback_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete feedback",
        )
