"""
Funds Routes - Protected endpoints for pension fund comparison features

Provides different levels of access based on user role:
- Free users: Limited to first 10 funds
- Subscribers: Full access to all comparison features
- Admins: Full access + additional management capabilities
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
import logging

from backend.auth import auth_required, require_permission, require_active_subscription
from backend.auth.models import AuthClaims
from backend.auth.roles import Permission, UserRole, UserStatus, can_access_feature
from backend.services import user_service

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/funds", tags=["funds"])


# Mock data - in production this would come from a database/service
# This represents your pensionFundsData from frontend
MOCK_FUNDS = [
    {"id": f"fund_{i}", "name": f"Fondo {i}", "category": "azionario", "cost": 0.5 + i * 0.1}
    for i in range(1, 51)
]


@router.get("/list")
async def list_funds(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    category: Optional[str] = Query(default=None),
    claims: AuthClaims = Depends(auth_required)
):
    """
    List pension funds with role-based access control.
    
    Access levels:
    - Free users: Max 10 funds (enforced)
    - Subscribers: All funds
    - Admins: All funds
    
    Query Parameters:
    - limit: Number of funds to return (1-100)
    - offset: Pagination offset
    - category: Filter by category (optional)
    """
    try:
        # Get user profile to check role and status
        user_profile = await user_service.get_user_by_id(claims.sub)
        
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
        
        # Get user status - default to PENDING if not set (secure by default)
        user_status = UserStatus(user_profile.status or "pending")
        
        # Check if user can view all funds
        can_view_all = can_access_feature(user_role, user_status, Permission.VIEW_ALL_FUNDS)
        
        # Free users are limited to 10 funds
        if not can_view_all:
            if limit > 10:
                limit = 10
            max_available = 10
        else:
            max_available = len(MOCK_FUNDS)
        
        # Apply filters (mock implementation)
        funds = MOCK_FUNDS
        if category:
            funds = [f for f in funds if f.get("category") == category]
        
        # Apply pagination
        paginated_funds = funds[offset:offset + limit]
        
        return {
            "funds": paginated_funds,
            "total": len(funds),
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < len(funds),
            "user_access": {
                "role": user_role.value,
                "status": user_status.value,
                "can_view_all": can_view_all,
                "max_funds": max_available
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing funds: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve funds"
        )


@router.get("/{fund_id}")
async def get_fund_details(
    fund_id: str,
    claims: AuthClaims = Depends(auth_required)
):
    """
    Get detailed information about a specific fund.
    
    All authenticated users can view fund details.
    """
    # Mock implementation
    fund = next((f for f in MOCK_FUNDS if f["id"] == fund_id), None)
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fund {fund_id} not found"
        )
    
    return fund


@router.post("/compare")
async def compare_funds(
    fund_ids: List[str],
    claims: AuthClaims = Depends(require_permission(Permission.COMPARE_FUNDS))
):
    """
    Compare multiple pension funds.
    
    Requires: COMPARE_FUNDS permission (Subscriber or Admin with active status)
    
    This endpoint performs detailed comparison analysis.
    """
    if len(fund_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 funds required for comparison"
        )
    
    if len(fund_ids) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 funds can be compared at once"
        )
    
    # Mock comparison
    funds = [f for f in MOCK_FUNDS if f["id"] in fund_ids]
    
    if len(funds) != len(fund_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more funds not found"
        )
    
    return {
        "funds": funds,
        "comparison": {
            "best_performance": funds[0]["id"],
            "lowest_cost": funds[0]["id"],
            "recommendation": "Based on your profile..."
        }
    }


@router.get("/filters/options")
async def get_filter_options(
    claims: AuthClaims = Depends(auth_required)
):
    """
    Get available filter options (categories, companies, etc.)
    
    Available to all authenticated users.
    """
    return {
        "categories": ["azionario", "bilanciato", "obbligazionario", "garantito"],
        "companies": ["Compagnia A", "Compagnia B", "Compagnia C"],
        "types": ["FPN", "FPA", "PIP"]
    }


@router.post("/analysis/{fund_id}")
async def analyze_fund(
    fund_id: str,
    claims: AuthClaims = Depends(require_permission(Permission.COMPARE_FUNDS))
):
    """
    Perform advanced analysis on a specific fund.
    
    Requires: COMPARE_FUNDS permission (Subscriber or Admin)
    
    This is for the "have-fund" section where users analyze their current fund.
    """
    fund = next((f for f in MOCK_FUNDS if f["id"] == fund_id), None)
    
    if not fund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fund {fund_id} not found"
        )
    
    return {
        "fund": fund,
        "analysis": {
            "performance_score": 7.5,
            "cost_efficiency": 8.0,
            "risk_level": "medium",
            "alternatives": [
                {"id": "fund_2", "name": "Better Alternative 1"},
                {"id": "fund_3", "name": "Better Alternative 2"}
            ],
            "recommendation": "Your fund is performing well, but here are some alternatives..."
        }
    }


@router.get("/recommendations")
async def get_recommendations(
    risk_profile: Optional[str] = Query(default=None),
    claims: AuthClaims = Depends(require_active_subscription())
):
    """
    Get personalized fund recommendations.
    
    Requires: Active subscription (Subscriber or Admin with active status)
    
    Provides AI-powered recommendations based on user profile.
    """
    # Mock recommendations
    return {
        "recommended_funds": [
            {"id": "fund_1", "name": "Top Pick", "score": 9.5, "reason": "Best fit for your profile"},
            {"id": "fund_2", "name": "Second Best", "score": 9.0, "reason": "Low cost, good returns"},
        ],
        "risk_profile": risk_profile or "balanced",
        "personalized": True
    }
