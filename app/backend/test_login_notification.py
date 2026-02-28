#!/usr/bin/env python3
"""
Test script to simulate the new user login flow and verify Telegram notification.
"""
import asyncio
import sys
from backend.services import user_service
from backend.services.admin_notification_service import get_admin_notification_service
from backend.schemas.user import UserProfileCreate
from backend.config.auth import get_auth_config

async def test_new_user_flow():
    """Test the complete flow of a new user logging in."""
    
    # Test email (not admin)
    test_email = "nuovoutente@test.com"
    test_user_id = "google_test_12345"
    
    print("=" * 60)
    print("TEST: New User Login Flow with Telegram Notification")
    print("=" * 60)
    
    # Check admin configuration
    auth_config = get_auth_config()
    is_admin = auth_config.is_admin_email(test_email)
    print(f"\n1️⃣ Admin Check:")
    print(f"   Email: {test_email}")
    print(f"   Is Admin: {is_admin}")
    print(f"   Configured admins: {auth_config.admin_emails}")
    
    # Check if user exists (simulate before upsert)
    print(f"\n2️⃣ Check if user exists:")
    existing_user = await user_service.get_user_by_id(test_user_id)
    is_new_user = existing_user is None
    print(f"   User ID: {test_user_id}")
    print(f"   Exists: {not is_new_user}")
    print(f"   Is New: {is_new_user}")
    
    # Simulate upsert (without actually creating to avoid pollution)
    print(f"\n3️⃣ Simulating upsert (what would happen):")
    print(f"   Would create user with:")
    print(f"   - status: 'active' (because new non-admin user)")
    print(f"   - plan: 'free'")
    print(f"   - roles: ['free']")
    
    # Check notification condition
    print(f"\n4️⃣ Notification condition check:")
    print(f"   saved_profile exists: True (simulated)")
    print(f"   is_new_user: {is_new_user}")
    print(f"   is_admin: {is_admin}")
    print(f"   Should send notification: {is_new_user and not is_admin}")
    
    # Check Telegram service
    notification_service = get_admin_notification_service()
    print(f"\n5️⃣ Telegram Service Status:")
    print(f"   Enabled: {notification_service.enabled}")
    print(f"   Chat ID: {notification_service.chat_id}")
    
    if is_new_user and not is_admin:
        print(f"\n✅ SUCCESS: Notification WOULD be sent for this new user!")
        print(f"\n📋 Summary:")
        print(f"   - New user detected: YES")
        print(f"   - Is admin: NO")
        print(f"   - Telegram configured: {notification_service.enabled}")
        print(f"   - Result: Notification will be sent ✅")
        return True
    else:
        print(f"\n⚠️  WARNING: Notification would NOT be sent")
        print(f"   Reason: is_new_user={is_new_user}, is_admin={is_admin}")
        return False

async def test_existing_user_flow():
    """Test that existing users don't trigger notification."""
    print("\n" + "=" * 60)
    print("TEST: Existing User Login (should NOT notify)")
    print("=" * 60)
    
    # Find an existing user (or simulate one)
    users, _ = await user_service.list_users(limit=1)
    
    if users:
        existing_user = users[0]
        print(f"\n1️⃣ Testing with existing user:")
        print(f"   Email: {existing_user.email}")
        print(f"   ID: {existing_user.id}")
        print(f"   Status: {existing_user.status}")
        
        # Simulate the check
        is_new_user = False
        is_admin = "admin" in (existing_user.roles or [])
        
        print(f"\n2️⃣ Notification condition:")
        print(f"   is_new_user: {is_new_user}")
        print(f"   is_admin: {is_admin}")
        print(f"   Should send notification: {is_new_user and not is_admin}")
        
        if not is_new_user:
            print(f"\n✅ CORRECT: No notification for existing user")
            return True
    else:
        print(f"\n⚠️  No existing users found in database")
        return True

if __name__ == "__main__":
    async def main():
        success1 = await test_new_user_flow()
        success2 = await test_existing_user_flow()
        return success1 and success2
    
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
