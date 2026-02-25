"""
Role-based access control definitions for the application.

This module defines the user roles, approval states, and permissions.
"""

from enum import Enum
from typing import List


class UserRole(str, Enum):
    """User roles in the system."""
    FREE = "free"           # Free user with limited access
    SUBSCRIBER = "subscriber"  # Paid subscriber with full access
    ADMIN = "admin"         # Administrator with user management capabilities
    

class UserStatus(str, Enum):
    """User approval status."""
    PENDING = "pending"     # New user, awaiting admin approval
    ACTIVE = "active"       # Approved and active user
    SUSPENDED = "suspended" # Temporarily suspended by admin
    REJECTED = "rejected"   # Registration rejected by admin


class Permission(str, Enum):
    """Specific permissions that can be granted to users."""
    # Free user permissions
    VIEW_GUIDE = "view_guide"
    VIEW_FAQ = "view_faq"
    VIEW_LIMITED_FUNDS = "view_limited_funds"  # Only first 10 funds
    
    # Subscriber permissions
    VIEW_ALL_FUNDS = "view_all_funds"
    COMPARE_FUNDS = "compare_funds"
    USE_SIMULATOR = "use_simulator"
    DOWNLOAD_REPORTS = "download_reports"
    ADVANCED_FILTERS = "advanced_filters"
    
    # Admin permissions
    MANAGE_USERS = "manage_users"
    APPROVE_USERS = "approve_users"
    VIEW_ANALYTICS = "view_analytics"
    MANAGE_CONTENT = "manage_content"


# Map roles to their permissions
ROLE_PERMISSIONS: dict[UserRole, List[Permission]] = {
    UserRole.FREE: [
        Permission.VIEW_GUIDE,
        Permission.VIEW_FAQ,
        Permission.VIEW_LIMITED_FUNDS,
    ],
    UserRole.SUBSCRIBER: [
        Permission.VIEW_GUIDE,
        Permission.VIEW_FAQ,
        Permission.VIEW_ALL_FUNDS,
        Permission.COMPARE_FUNDS,
        Permission.USE_SIMULATOR,
        Permission.DOWNLOAD_REPORTS,
        Permission.ADVANCED_FILTERS,
    ],
    UserRole.ADMIN: [
        # Admins have all permissions
        Permission.VIEW_GUIDE,
        Permission.VIEW_FAQ,
        Permission.VIEW_ALL_FUNDS,
        Permission.COMPARE_FUNDS,
        Permission.USE_SIMULATOR,
        Permission.DOWNLOAD_REPORTS,
        Permission.ADVANCED_FILTERS,
        Permission.MANAGE_USERS,
        Permission.APPROVE_USERS,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_CONTENT,
    ],
}


def get_role_permissions(role: UserRole) -> List[Permission]:
    """Get all permissions for a given role."""
    return ROLE_PERMISSIONS.get(role, [])


def has_permission(role: UserRole, permission: Permission) -> bool:
    """Check if a role has a specific permission."""
    return permission in get_role_permissions(role)


def is_active_subscriber(role: UserRole, status: UserStatus) -> bool:
    """
    Check if user is an active subscriber (has paid and been approved).
    
    A user is considered an active subscriber if:
    1. They have subscriber or admin role
    2. Their status is ACTIVE
    """
    return role in [UserRole.SUBSCRIBER, UserRole.ADMIN] and status == UserStatus.ACTIVE


def can_access_feature(role: UserRole, status: UserStatus, permission: Permission) -> bool:
    """
    Check if a user can access a feature based on their role and status.
    
    Args:
        role: User's role
        status: User's approval status
        permission: Permission to check
        
    Returns:
        True if user has access, False otherwise
    """
    # Suspended or rejected users have no access
    if status in [UserStatus.SUSPENDED, UserStatus.REJECTED]:
        return False
    
    # Free users can access free features regardless of status
    if role == UserRole.FREE:
        return has_permission(role, permission)
    
    # Subscribers and admins need ACTIVE status to access paid features
    if role in [UserRole.SUBSCRIBER, UserRole.ADMIN]:
        if status == UserStatus.ACTIVE:
            return has_permission(role, permission)
        # If pending, they can only access free features
        if status == UserStatus.PENDING:
            return has_permission(UserRole.FREE, permission)
    
    return False
