"""
Admin Routes for User Management

Endpoints for administrators to manage users, approve subscriptions,
and handle user roles and status.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
import logging

from backend.auth import auth_required, require_roles
from backend.auth.models import AuthClaims
from backend.auth.roles import UserRole, UserStatus, Permission, can_access_feature
from backend.schemas.user import (
    UserProfile,
    UserListResponse,
    UserApprovalRequest,
    UserRoleUpdateRequest,
    UserStatusUpdateRequest,
)
from backend.services import user_service
from backend.services.admin_notification_service import AdminNotificationService

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/admin/users", tags=["admin"])

# Initialize notification service
notification_service = AdminNotificationService()


@router.get("/pending", response_model=List[UserProfile])
async def list_pending_users(
    limit: int = Query(default=25, ge=1, le=100),
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    List all users awaiting admin approval.
    
    Only users with 'admin' role can access this endpoint.
    Returns users with status='pending' who have paid but need manual approval.
    """
    try:
        users = await user_service.list_pending_users(limit=limit)
        return users
    except Exception as e:
        logger.error(f"Error listing pending users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve pending users"
        )


@router.get("", response_model=UserListResponse)
async def list_all_users(
    limit: int = Query(default=25, ge=1, le=100),
    cursor: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    List all users with optional filtering and pagination.
    
    Query Parameters:
    - limit: Maximum number of users to return (1-100)
    - cursor: Pagination cursor for next page
    - status: Filter by user status (pending, active, suspended, rejected)
    """
    try:
        users, next_cursor = await user_service.list_users(
            limit=limit,
            cursor=cursor
        )
        
        # Apply status filter if provided
        if status_filter:
            users = [u for u in users if u.status == status_filter]
        
        return UserListResponse(
            items=users,
            next_cursor=next_cursor
        )
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_details(
    user_id: str,
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    Get detailed information about a specific user.
    """
    try:
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )


@router.post("/approve", response_model=UserProfile)
async def approve_user(
    request: UserApprovalRequest,
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    Approve or reject a pending user's subscription request.
    
    Actions:
    - 'approve': Grant subscriber access (status=active, role=subscriber)
    - 'reject': Deny access, keep as free user (status=rejected, role=free)
    """
    try:
        if request.action.lower() == "approve":
            user = await user_service.approve_user(
                user_id=request.user_id,
                approved_by=claims.sub
            )
            logger.info(f"User {request.user_id} approved by admin {claims.sub}")
            
            # Send Telegram notification
            try:
                await notification_service.notify_user_approved(user, approved_by=claims.sub)
            except Exception as e:
                logger.error(f"Failed to send approval notification: {e}")
            
            return user
            
        elif request.action.lower() == "reject":
            user = await user_service.reject_user(
                user_id=request.user_id,
                reason=request.reason,
                rejected_by=claims.sub
            )
            logger.info(f"User {request.user_id} rejected by admin {claims.sub}")
            
            # Send Telegram notification
            try:
                await notification_service.notify_user_rejected(
                    user, 
                    reason=request.reason or "Not specified",
                    rejected_by=claims.sub
                )
            except Exception as e:
                logger.error(f"Failed to send rejection notification: {e}")
            
            return user
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action must be 'approve' or 'reject'"
            )
            
    except user_service.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {request.user_id} not found"
        )
    except Exception as e:
        logger.error(f"Error processing approval for user {request.user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process user approval"
        )


@router.post("/suspend", response_model=UserProfile)
async def suspend_user(
    request: UserStatusUpdateRequest,
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    Temporarily suspend a user's access.
    
    Suspended users cannot access any paid features until reactivated.
    """
    try:
        user = await user_service.suspend_user(
            user_id=request.user_id,
            reason=request.reason,
            suspended_by=claims.sub
        )
        logger.info(f"User {request.user_id} suspended by admin {claims.sub}")
        
        # Send Telegram notification
        try:
            await notification_service.notify_user_suspended(
                user,
                reason=request.reason or "Not specified",
                suspended_by=claims.sub
            )
        except Exception as e:
            logger.error(f"Failed to send suspension notification: {e}")
        
        return user
        
    except user_service.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {request.user_id} not found"
        )
    except Exception as e:
        logger.error(f"Error suspending user {request.user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to suspend user"
        )


@router.post("/reactivate", response_model=UserProfile)
async def reactivate_user(
    user_id: str,
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    Reactivate a suspended user, restoring their access.
    """
    try:
        user = await user_service.reactivate_user(
            user_id=user_id,
            reactivated_by=claims.sub
        )
        logger.info(f"User {user_id} reactivated by admin {claims.sub}")
        
        # Send Telegram notification
        try:
            await notification_service.notify_user_reactivated(user, reactivated_by=claims.sub)
        except Exception as e:
            logger.error(f"Failed to send reactivation notification: {e}")
        
        return user
        
    except user_service.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    except Exception as e:
        logger.error(f"Error reactivating user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reactivate user"
        )


@router.post("/update-plan", response_model=UserProfile)
async def update_user_plan(
    user_id: str,
    plan: str,
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    Update a user's subscription plan.
    
    Plans:
    - 'free': Free tier with limited access
    - 'full-access': Full access to all features
    
    Note: When downgrading to free, the user's status is not changed.
    When upgrading to full-access, the user's status is set to active.
    """
    try:
        # Validate plan
        if plan not in ["free", "full-access"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Plan must be 'free' or 'full-access'"
            )
        
        # Get current user
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise user_service.UserNotFoundError(user_id)
        
        # Don't allow changing admin plans
        if "admin" in user.roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify admin user plans"
            )
        
        # Update the plan
        from backend.schemas.user import UserProfileUpdate
        
        update_data = {"plan": plan}
        
        # If upgrading to full-access, also set status to active and role to subscriber
        if plan == "full-access":
            update_data["status"] = "active"
            update_data["roles"] = ["subscriber"]
        # If downgrading to free, set role to free but keep current status
        elif plan == "free":
            update_data["roles"] = ["free"]
        
        updated_user = await user_service.update_user(user_id, UserProfileUpdate(**update_data))
        
        logger.info(f"User {user_id} plan updated to '{plan}' by admin {claims.sub}")
        
        return updated_user
        
    except user_service.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating plan for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user plan"
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    Permanently delete a user from the system.
    
    This removes the user from both Firestore and Firebase Authentication.
    This action cannot be undone.
    """
    try:
        # Delete from Firestore
        await user_service.delete_user(user_id)
        
        # Optionally delete from Firebase Auth
        # from backend.providers.firebase_auth import delete_firebase_user
        # await delete_firebase_user(user_id)
        
        logger.info(f"User {user_id} deleted by admin {claims.sub}")
        
        return {"success": True, "message": f"User {user_id} deleted successfully"}
        
    except user_service.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )


@router.get("/stats/overview")
async def get_user_stats(
    claims: AuthClaims = Depends(require_roles("admin"))
):
    """
    Get overview statistics about users in the system.
    
    Returns counts by status and role.
    """
    try:
        all_users, _ = await user_service.list_users(limit=1000)
        
        stats = {
            "total": len(all_users),
            "by_status": {
                "pending": sum(1 for u in all_users if u.status == "pending"),
                "active": sum(1 for u in all_users if u.status == "active"),
                "suspended": sum(1 for u in all_users if u.status == "suspended"),
                "rejected": sum(1 for u in all_users if u.status == "rejected"),
            },
            "by_role": {
                "free": sum(1 for u in all_users if "free" in (u.roles or [])),
                "subscriber": sum(1 for u in all_users if "subscriber" in (u.roles or [])),
                "admin": sum(1 for u in all_users if "admin" in (u.roles or [])),
            }
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user statistics"
        )
