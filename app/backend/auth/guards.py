"""
Role Guards - Decorators for route protection

This module provides convenient decorators for protecting routes based on:
- User roles (free, subscriber, admin)
- User status (pending, active, suspended, rejected)
- Specific permissions

These decorators wrap the FastAPI dependencies for cleaner route definitions.
"""

from functools import wraps
from typing import Callable, List
from fastapi import HTTPException, status

from .deps import (
    auth_required,
    require_roles,
    require_permission,
    require_active_subscription,
    optional_auth
)
from .roles import Permission, UserRole, UserStatus, can_access_feature
from backend.services import user_service


def free_access(func: Callable) -> Callable:
    """
    Decorator for routes accessible to all users (even unauthenticated).
    
    Usage:
        @router.get("/public")
        @free_access
        async def public_route():
            return {"message": "Available to everyone"}
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # No authentication required
        return await func(*args, **kwargs)
    return wrapper


def authenticated_only(func: Callable) -> Callable:
    """
    Decorator for routes that require authentication (any role).
    
    Usage:
        @router.get("/protected")
        @authenticated_only
        async def protected_route(claims: AuthClaims = Depends(auth_required)):
            return {"user": claims.sub}
    """
    # This is just a marker - the actual protection is done by auth_required dependency
    return func


def subscriber_only(func: Callable) -> Callable:
    """
    Decorator for routes that require active subscription.
    
    Checks:
    - User has subscriber or admin role
    - User status is active (approved by admin)
    
    Usage:
        @router.get("/premium-feature")
        @subscriber_only
        async def premium_route(claims: AuthClaims = Depends(require_active_subscription())):
            return {"message": "Premium content"}
    """
    return func


def admin_only(func: Callable) -> Callable:
    """
    Decorator for routes that require admin role.
    
    Usage:
        @router.get("/admin/dashboard")
        @admin_only
        async def admin_route(claims: AuthClaims = Depends(require_roles("admin"))):
            return {"message": "Admin area"}
    """
    return func


# Role-based guard helpers
class RoleGuard:
    """
    Helper class for checking user roles and permissions.
    
    Usage in routes:
        guard = RoleGuard()
        user_profile = await user_service.get_user_by_id(claims.sub)
        
        if not guard.can_access(user_profile, Permission.USE_SIMULATOR):
            raise HTTPException(403, "Access denied")
    """
    
    @staticmethod
    def has_role(user_profile, *roles: str) -> bool:
        """Check if user has any of the specified roles."""
        if not user_profile or not user_profile.roles:
            return False
        
        user_roles = set(r.lower() for r in user_profile.roles)
        required_roles = set(r.lower() for r in roles)
        
        return bool(user_roles.intersection(required_roles))
    
    @staticmethod
    def is_active(user_profile) -> bool:
        """Check if user status is active."""
        if not user_profile:
            return False
        return user_profile.status == "active"
    
    @staticmethod
    def is_pending(user_profile) -> bool:
        """Check if user is awaiting approval."""
        if not user_profile:
            return False
        return user_profile.status == "pending"
    
    @staticmethod
    def is_suspended(user_profile) -> bool:
        """Check if user is suspended."""
        if not user_profile:
            return False
        return user_profile.status == "suspended"
    
    @staticmethod
    def can_access(user_profile, permission: Permission) -> bool:
        """Check if user has permission to access a feature."""
        if not user_profile:
            return False
        
        # Determine user role
        user_role = UserRole.FREE
        if "admin" in user_profile.roles:
            user_role = UserRole.ADMIN
        elif "subscriber" in user_profile.roles:
            user_role = UserRole.SUBSCRIBER
        
        # Default to PENDING if status not set (secure by default)
        user_status = UserStatus(user_profile.status or "pending")
        
        return can_access_feature(user_role, user_status, permission)
    
    @staticmethod
    def require_active_subscription_or_raise(user_profile):
        """
        Check if user has active subscription, raise HTTPException if not.
        
        Raises:
            HTTPException: 402 if subscription pending/missing
            HTTPException: 403 if suspended/rejected
        """
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Check if user has paid role
        has_paid_role = any(role in ["subscriber", "admin"] for role in user_profile.roles)
        
        if not has_paid_role:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Subscription required to access this feature"
            )
        
        # Check status
        if user_profile.status == "pending":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Your subscription is pending admin approval. Please wait for activation."
            )
        elif user_profile.status == "suspended":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended. Please contact support."
            )
        elif user_profile.status == "rejected":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your subscription request was not approved."
            )
        elif user_profile.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is not active"
            )
    
    @staticmethod
    def require_permission_or_raise(user_profile, permission: Permission):
        """
        Check if user has permission, raise HTTPException if not.
        
        Raises:
            HTTPException: 403 if permission denied
            HTTPException: 402 if subscription needed
        """
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Determine user role
        user_role = UserRole.FREE
        if "admin" in user_profile.roles:
            user_role = UserRole.ADMIN
        elif "subscriber" in user_profile.roles:
            user_role = UserRole.SUBSCRIBER
        
        # Default to PENDING if status not set (secure by default)
        user_status = UserStatus(user_profile.status or "pending")
        
        if not can_access_feature(user_role, user_status, permission):
            # Provide helpful error message
            if user_status == UserStatus.PENDING:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail="Your subscription is pending admin approval"
                )
            elif user_status == UserStatus.SUSPENDED:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your account has been suspended"
                )
            elif user_status == UserStatus.REJECTED:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your subscription request was not approved"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You don't have permission to access this feature. Upgrade required."
                )


# Export guard instance for easy import
role_guard = RoleGuard()


# Helper functions for common checks
async def ensure_user_can_access_feature(user_id: str, permission: Permission):
    """
    Helper function to check if user has permission to access a feature.
    
    Usage in routes:
        await ensure_user_can_access_feature(claims.sub, Permission.USE_SIMULATOR)
    
    Raises:
        HTTPException: If user doesn't have permission
    """
    user_profile = await user_service.get_user_by_id(user_id)
    role_guard.require_permission_or_raise(user_profile, permission)


async def ensure_user_has_active_subscription(user_id: str):
    """
    Helper function to check if user has active subscription.
    
    Usage in routes:
        await ensure_user_has_active_subscription(claims.sub)
    
    Raises:
        HTTPException: If subscription not active
    """
    user_profile = await user_service.get_user_by_id(user_id)
    role_guard.require_active_subscription_or_raise(user_profile)


async def get_user_access_level(user_id: str) -> dict:
    """
    Get user's access level information.
    
    Returns:
        dict: Access level details including role, status, and permissions
    """
    user_profile = await user_service.get_user_by_id(user_id)
    
    if not user_profile:
        return {
            "role": "anonymous",
            "status": None,
            "permissions": [],
            "can_access_simulator": False,
            "can_compare_funds": False,
            "can_view_all_funds": False
        }
    
    # Determine role
    role = "free"
    if "admin" in user_profile.roles:
        role = "admin"
    elif "subscriber" in user_profile.roles:
        role = "subscriber"
    
    # Check permissions
    return {
        "role": role,
        "status": user_profile.status,
        "permissions": [p.value for p in Permission if role_guard.can_access(user_profile, p)],
        "can_access_simulator": role_guard.can_access(user_profile, Permission.USE_SIMULATOR),
        "can_compare_funds": role_guard.can_access(user_profile, Permission.COMPARE_FUNDS),
        "can_view_all_funds": role_guard.can_access(user_profile, Permission.VIEW_ALL_FUNDS),
        "is_active": role_guard.is_active(user_profile),
        "is_pending": role_guard.is_pending(user_profile)
    }
