from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str | None = None
    picture: str | None = None
    roles: List[str] = Field(default_factory=lambda: ["free"])
    plan: str | None = "free"
    status: str | None = "active"  # pending, active, suspended, rejected
    credits: int = 0
    metadata: Dict[str, Any] | None = None


class UserProfileCreate(BaseModel):
    id: str
    email: EmailStr
    name: str | None = None
    picture: str | None = None
    hd: str | None = None  # Google Workspace domain if present
    roles: Optional[List[str]] = None  # Will be set by upsert_user based on admin config
    plan: Optional[str] = None  # Will be set by upsert_user based on admin config
    status: Optional[str] = None  # Will be set by upsert_user based on admin config
    credits: int | None = None
    metadata: Dict[str, Any] | None = None
    payment_intent_id: str | None = None  # Stripe payment reference


class UserProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    hd: Optional[str] = None
    roles: Optional[List[str]] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    credits: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    payment_intent_id: Optional[str] = None


class UserProfile(UserPublic):
    hd: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    last_login_at: datetime | None = None
    payment_intent_id: str | None = None


class UserListResponse(BaseModel):
    items: List[UserProfile]
    next_cursor: str | None = None


class UserApprovalRequest(BaseModel):
    """Request to approve or reject a pending user."""
    user_id: str
    action: str  # "approve" or "reject"
    reason: Optional[str] = None  # Optional reason for rejection


class UserRoleUpdateRequest(BaseModel):
    """Request to update user role."""
    user_id: str
    role: str  # "free", "subscriber", "admin"


class UserStatusUpdateRequest(BaseModel):
    """Request to update user status."""
    user_id: str
    status: str  # "pending", "active", "suspended", "rejected"
    reason: Optional[str] = None

