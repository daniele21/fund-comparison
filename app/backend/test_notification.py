#!/usr/bin/env python3
"""
Test script to verify Telegram notification is sent for new users.
"""
import asyncio
import sys
from backend.services.admin_notification_service import get_admin_notification_service
from backend.schemas.user import UserProfile
from datetime import datetime

async def test_notification():
    """Test sending a Telegram notification for a new user."""
    notification_service = get_admin_notification_service()
    
    # Check if Telegram is enabled
    if not notification_service.enabled:
        print("❌ FAIL: Telegram notifications are NOT enabled")
        print(f"   Bot token configured: {bool(notification_service.bot_token)}")
        print(f"   Chat ID configured: {bool(notification_service.chat_id)}")
        return False
    
    print("✅ Telegram notifications are enabled")
    print(f"   Chat ID: {notification_service.chat_id}")
    
    # Create a test user profile
    test_user = UserProfile(
        id="test_user_123",
        email="test@example.com",
        name="Test User",
        plan="free",
        status="active",
        roles=["free"],
        credits=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    print("\n📤 Sending test notification...")
    try:
        await notification_service.notify_new_pending_user(test_user)
        print("✅ Notification sent successfully!")
        print("\n🔔 Check your Telegram channel/chat for the message")
        return True
    except Exception as e:
        print(f"❌ FAIL: Error sending notification: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_notification())
    sys.exit(0 if success else 1)
