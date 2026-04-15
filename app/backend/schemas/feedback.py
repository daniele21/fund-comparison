from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class FeedbackPayload(BaseModel):
    """Feedback payload submitted from the frontend."""

    name: Optional[str] = Field(None, max_length=80)
    email: Optional[EmailStr] = None
    message: str = Field(..., min_length=10, max_length=2000)
    feedback_type: Literal["generic", "missing_fund", "wrong_data", "other"] = Field(
        default="generic",
        description="Type of feedback: generic, missing_fund, wrong_data, or other"
    )
    page_url: Optional[str] = Field(None, max_length=2048)
    user_agent: Optional[str] = Field(None, max_length=512)
    metadata: Optional[Dict[str, Any]] = None

    @field_validator("name", "message", "page_url", "user_agent", mode="before")
    @classmethod
    def _strip_strings(cls, value: Any) -> Any:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return None
        return value

    @field_validator("message")
    @classmethod
    def _ensure_message(cls, value: str) -> str:
        if not value:
            raise ValueError("message cannot be empty")
        return value


class FeedbackResponse(BaseModel):
    """Response returned after feedback submission."""

    status: Literal["accepted"] = "accepted"


class FeedbackEntry(BaseModel):
    """A stored feedback entry returned to admin."""

    id: str
    message: str
    feedback_type: str = "generic"
    name: Optional[str] = None
    email: Optional[str] = None
    page_url: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    status: str = "new"  # new | read | archived
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class FeedbackListResponse(BaseModel):
    """Paginated list of feedback entries."""

    items: List[FeedbackEntry]
    next_cursor: Optional[str] = None


class FeedbackStatusUpdate(BaseModel):
    """Request body to update feedback status."""

    status: Literal["new", "read", "archived"]
