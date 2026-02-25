from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Tuple
import os

from fastapi import HTTPException, status

from ..repositories import get_user_repository
from ..schemas.user import UserProfile, UserProfileCreate, UserProfileUpdate
from .admin_notification_service import get_admin_notification_service
from ..config.auth import get_auth_config


class UserAlreadyExistsError(ValueError):
    """Raised when attempting to create a user that already exists."""


class UserNotFoundError(ValueError):
    """Raised when a user cannot be found."""


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _is_firestore_enabled() -> bool:
    """Check if Firestore is enabled via environment variable."""
    return os.getenv("APP_FIRESTORE_ENABLED", "true").lower() in ("true", "1", "yes")


def _to_profile(data: dict) -> UserProfile:
    def _parse(value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value)
            except ValueError:
                return None
        return None

    return UserProfile(
        **{
            **data,
            "created_at": _parse(data.get("created_at")),
            "updated_at": _parse(data.get("updated_at")),
            "last_login_at": _parse(data.get("last_login_at")),
        }
    )


async def get_user_by_id(user_id: str) -> Optional[UserProfile]:
    if not _is_firestore_enabled():
        return None
    repo = get_user_repository()
    record = await repo.get(user_id)
    return _to_profile(record) if record else None


async def get_user_by_email(email: str) -> Optional[UserProfile]:
    if not _is_firestore_enabled():
        return None
    repo = get_user_repository()
    record = await repo.get_by_email(email)
    return _to_profile(record) if record else None


async def create_user(profile_in: UserProfileCreate) -> UserProfile:
    repo = get_user_repository()
    existing = await repo.get(profile_in.id)
    if existing:
        raise UserAlreadyExistsError(f"User {profile_in.id} already exists")

    payload = profile_in.model_dump(exclude_none=True)
    payload.setdefault("credits", 0)
    payload["last_login_at"] = payload.get("last_login_at") or _now()
    record = await repo.upsert(profile_in.id, payload)
    return _to_profile(record)


async def upsert_user(profile_in: UserProfileCreate, *, mark_login: bool = False) -> UserProfile:
    """
    Create or update a user profile. Set `mark_login` to refresh last_login_at.
    
    New users are created with status='pending' by default, requiring admin approval
    to become active subscribers (unless they are free users or admins).
    
    Admin users (based on email) are automatically granted admin role and active status.
    """
    if not _is_firestore_enabled():
        # Return a mock profile when Firestore is disabled
        return UserProfile(
            id=profile_in.id,
            email=profile_in.email,
            name=profile_in.name,
            plan=profile_in.plan or "free",
            status=profile_in.status or "pending",
            roles=profile_in.roles or ["free"],
            credits=0,
            created_at=_now(),
            updated_at=_now(),
            last_login_at=_now() if mark_login else None,
        )
    
    repo = get_user_repository()
    
    # Check if user already exists
    existing = await repo.get(profile_in.id)
    is_new_user = not existing
    
    payload = profile_in.model_dump(exclude_none=True)
    payload.setdefault("credits", 0)
    
    # Check if user is admin based on email
    auth_config = get_auth_config()
    user_email = profile_in.email or ""
    is_admin = auth_config.is_admin_email(user_email)
    
    # DEBUG LOG - Remove after testing
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"🔍 ADMIN CHECK - Email: {user_email}")
    logger.info(f"🔍 ADMIN CHECK - Configured admin emails: {auth_config.admin_emails}")
    logger.info(f"🔍 ADMIN CHECK - Is admin: {is_admin}")
    logger.info(f"🔍 ADMIN CHECK - User exists: {existing is not None}")
    logger.info(f"🔍 ADMIN CHECK - Payload before defaults: {payload}")
    
    # Set default values for new users
    if not existing:
        if is_admin:
            # Admin users get special treatment
            payload.setdefault("plan", "full-access")
            payload.setdefault("status", "active")
            payload.setdefault("roles", ["admin"])
        else:
            # Regular users: if plan was specified (e.g., from invite code), keep it
            # Otherwise default to free plan and pending status
            payload.setdefault("plan", "free")
            payload.setdefault("status", "pending")
            payload.setdefault("roles", ["free"])
    else:
        # For existing users, update to admin if they're in the admin list
        if is_admin and "admin" not in (existing.get("roles") or []):
            payload["roles"] = ["admin"]
            payload["status"] = "active"
            payload["plan"] = "full-access"
    
    logger.info(f"🔍 ADMIN CHECK - Payload after defaults: {payload}")
    
    if mark_login:
        payload["last_login_at"] = _now()
    
    record = await repo.upsert(profile_in.id, payload)
    user_profile = _to_profile(record)
    
    # Send notification for new users (except admins)
    if is_new_user and not is_admin:
        try:
            notification_service = get_admin_notification_service()
            await notification_service.notify_new_pending_user(
                user=user_profile,
                payment_info=None  # Will be added when payment is processed
            )
        except Exception as e:
            # Don't fail user creation if notification fails
            import logging
            logging.getLogger(__name__).error(f"Failed to send new user notification: {e}")
    
    return user_profile


async def update_user(user_id: str, profile_update: UserProfileUpdate) -> UserProfile:
    repo = get_user_repository()
    existing = await repo.get(user_id)
    if not existing:
        raise UserNotFoundError(user_id)

    payload = profile_update.model_dump(exclude_none=True)
    record = await repo.upsert(user_id, payload)
    return _to_profile(record)


async def list_users(*, limit: int = 25, cursor: Optional[str] = None) -> Tuple[list[UserProfile], Optional[str]]:
    repo = get_user_repository()
    result = await repo.list(limit=limit, cursor=cursor)
    return [_to_profile(item) for item in result.items], result.next_cursor


async def list_pending_users(*, limit: int = 25) -> list[UserProfile]:
    """Get all users awaiting admin approval."""
    repo = get_user_repository()
    result = await repo.list_pending_users(limit=limit)
    return [_to_profile(item) for item in result.items]


async def approve_user(user_id: str, approved_by: str) -> UserProfile:
    """
    Approve a pending user, granting them subscriber access.
    
    Args:
        user_id: ID of the user to approve
        approved_by: ID of the admin approving the user
        
    Returns:
        Updated user profile
    """
    repo = get_user_repository()
    existing = await repo.get(user_id)
    if not existing:
        raise UserNotFoundError(user_id)
    
    # Update to active status and subscriber role
    payload = {
        "status": "active",
        "roles": ["subscriber"],
        "plan": "full-access",
        "metadata": {
            **(existing.get("metadata") or {}),
            "approved_at": _now().isoformat(),
            "approved_by": approved_by,
        }
    }
    
    record = await repo.upsert(user_id, payload)
    user_profile = _to_profile(record)
    
    # Send notification
    try:
        notification_service = get_admin_notification_service()
        await notification_service.notify_user_approved(
            user=user_profile,
            approved_by=approved_by
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to send approval notification: {e}")
    
    return user_profile


async def reject_user(user_id: str, reason: Optional[str], rejected_by: str) -> UserProfile:
    """
    Reject a pending user's subscription request.
    
    Args:
        user_id: ID of the user to reject
        reason: Optional reason for rejection
        rejected_by: ID of the admin rejecting the user
        
    Returns:
        Updated user profile
    """
    repo = get_user_repository()
    existing = await repo.get(user_id)
    if not existing:
        raise UserNotFoundError(user_id)
    
    # Update to rejected status and keep as free user
    payload = {
        "status": "rejected",
        "roles": ["free"],
        "plan": "free",
        "metadata": {
            **(existing.get("metadata") or {}),
            "rejected_at": _now().isoformat(),
            "rejected_by": rejected_by,
            "rejection_reason": reason or "Not specified",
        }
    }
    
    record = await repo.upsert(user_id, payload)
    user_profile = _to_profile(record)
    
    # Send notification
    try:
        notification_service = get_admin_notification_service()
        await notification_service.notify_user_rejected(
            user=user_profile,
            rejected_by=rejected_by,
            reason=reason
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to send rejection notification: {e}")
    
    return user_profile


async def suspend_user(user_id: str, reason: Optional[str], suspended_by: str) -> UserProfile:
    """
    Temporarily suspend a user's access.
    
    Args:
        user_id: ID of the user to suspend
        reason: Optional reason for suspension
        suspended_by: ID of the admin suspending the user
        
    Returns:
        Updated user profile
    """
    repo = get_user_repository()
    existing = await repo.get(user_id)
    if not existing:
        raise UserNotFoundError(user_id)
    
    payload = {
        "status": "suspended",
        "metadata": {
            **(existing.get("metadata") or {}),
            "suspended_at": _now().isoformat(),
            "suspended_by": suspended_by,
            "suspension_reason": reason or "Not specified",
        }
    }
    
    record = await repo.upsert(user_id, payload)
    user_profile = _to_profile(record)
    
    # Send notification
    try:
        notification_service = get_admin_notification_service()
        await notification_service.notify_user_suspended(
            user=user_profile,
            suspended_by=suspended_by,
            reason=reason
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to send suspension notification: {e}")
    
    return user_profile


async def reactivate_user(user_id: str, reactivated_by: str) -> UserProfile:
    """
    Reactivate a suspended user.
    
    Args:
        user_id: ID of the user to reactivate
        reactivated_by: ID of the admin reactivating the user
        
    Returns:
        Updated user profile
    """
    repo = get_user_repository()
    existing = await repo.get(user_id)
    if not existing:
        raise UserNotFoundError(user_id)
    
    payload = {
        "status": "active",
        "metadata": {
            **(existing.get("metadata") or {}),
            "reactivated_at": _now().isoformat(),
            "reactivated_by": reactivated_by,
        }
    }
    
    record = await repo.upsert(user_id, payload)
    user_profile = _to_profile(record)
    
    # Send notification
    try:
        notification_service = get_admin_notification_service()
        await notification_service.notify_user_reactivated(
            user=user_profile,
            reactivated_by=reactivated_by
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to send reactivation notification: {e}")
    
    return user_profile


async def delete_user(user_id: str) -> None:
    repo = get_user_repository()
    existing = await repo.get(user_id)
    if not existing:
        raise UserNotFoundError(user_id)
    await repo.delete(user_id)


def handle_service_error(exc: Exception) -> None:
    """Translate service-layer exceptions into HTTP errors."""
    if isinstance(exc, UserAlreadyExistsError):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
    if isinstance(exc, UserNotFoundError):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{exc.args[0]}' not found",
        ) from exc
    raise exc
