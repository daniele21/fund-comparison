#!/usr/bin/env python3
"""
Script di test per verificare la configurazione admin.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app', 'backend'))

from config.auth import get_auth_config

def test_admin_config():
    """Test configurazione admin."""
    print("🔍 Testing Admin Configuration...")
    print("-" * 50)
    
    # Carica configurazione
    auth_config = get_auth_config()
    
    # Verifica admin emails
    print(f"\n📧 Admin emails configurate: {auth_config.admin_emails}")
    
    # Test email admin
    test_emails = [
        "danielemoltisanti@gmail.com",
        "DANIELEMOLTISANTI@GMAIL.COM",  # Test case insensitive
        "danielemoltisanti@gmail.com ",  # Test con spazi
        "utente@example.com",  # Non admin
    ]
    
    print("\n🧪 Test verifica email admin:")
    for email in test_emails:
        is_admin = auth_config.is_admin_email(email)
        status = "✅ ADMIN" if is_admin else "❌ NOT ADMIN"
        print(f"  {status}: {email!r}")
    
    print("\n" + "=" * 50)
    print("✅ Test completato con successo!")
    return True

if __name__ == "__main__":
    try:
        success = test_admin_config()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Errore durante il test: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
