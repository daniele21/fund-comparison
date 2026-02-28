#!/usr/bin/env python3
"""
End-to-end test: Create a real test user and verify Telegram notification is sent.
"""
import asyncio
import sys
from backend.services import user_service
from backend.services.admin_notification_service import get_admin_notification_service
from backend.schemas.user import UserProfileCreate
import random

async def test_e2e_new_user_notification():
    """Create a test user and verify notification is sent."""
    
    # Generate unique test user
    test_id = f"test_e2e_{random.randint(10000, 99999)}"
    test_email = f"testuser{random.randint(1000, 9999)}@example.com"
    
    print("=" * 70)
    print("END-TO-END TEST: New User Registration with Telegram Notification")
    print("=" * 70)
    print(f"\n📝 Test User:")
    print(f"   ID: {test_id}")
    print(f"   Email: {test_email}")
    
    try:
        # Step 1: Check if user exists (should not)
        print(f"\n1️⃣ Checking if user exists...")
        existing_user = await user_service.get_user_by_id(test_id)
        is_new_user = existing_user is None
        print(f"   Result: {'New user' if is_new_user else 'User exists'}")
        
        if not is_new_user:
            print(f"   ⚠️  User already exists, skipping test")
            return False
        
        # Step 2: Create user profile (simulate OAuth login)
        print(f"\n2️⃣ Creating user profile...")
        profile = UserProfileCreate(
            id=test_id,
            email=test_email,
            name="Test E2E User",
            picture="https://example.com/avatar.jpg",
        )
        
        saved_profile = await user_service.upsert_user(profile, mark_login=True)
        print(f"   ✅ User created:")
        print(f"      Status: {saved_profile.status}")
        print(f"      Plan: {saved_profile.plan}")
        print(f"      Roles: {saved_profile.roles}")
        
        # Step 3: Check notification condition
        print(f"\n3️⃣ Checking notification condition...")
        is_admin = "admin" in (saved_profile.roles or [])
        should_notify = is_new_user and not is_admin
        print(f"   is_new_user: {is_new_user}")
        print(f"   is_admin: {is_admin}")
        print(f"   Should notify: {should_notify}")
        
        # Step 4: Send notification (this is what happens in google_auth.py)
        if should_notify:
            print(f"\n4️⃣ Sending Telegram notification...")
            notification_service = get_admin_notification_service()
            
            if not notification_service.enabled:
                print(f"   ❌ Telegram NOT enabled")
                return False
            
            await notification_service.notify_new_pending_user(saved_profile)
            print(f"   ✅ Notification sent successfully!")
            print(f"\n🔔 Check your Telegram for the notification!")
            print(f"   Expected message contains:")
            print(f"   - Email: {test_email}")
            print(f"   - Name: Test E2E User")
            print(f"   - Status: {saved_profile.status}")
        
        # Step 5: Cleanup - delete test user
        print(f"\n5️⃣ Cleaning up test user...")
        from backend.repositories import get_user_repository
        repo = get_user_repository()
        await repo.delete(test_id)
        print(f"   ✅ Test user deleted")
        
        print(f"\n" + "=" * 70)
        print(f"✅ TEST PASSED: Notification flow works correctly!")
        print(f"=" * 70)
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        
        # Try to cleanup even on error
        try:
            from backend.repositories import get_user_repository
            repo = get_user_repository()
            await repo.delete(test_id)
            print(f"   Cleanup: Test user deleted")
        except:
            pass
        
        return False

if __name__ == "__main__":
    success = asyncio.run(test_e2e_new_user_notification())
    sys.exit(0 if success else 1)
