#!/usr/bin/env python3
"""
Script per verificare la configurazione admin senza accedere al database.
"""

import sys
import os

# Aggiungi il path del backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app', 'backend'))

print("=" * 70)
print("🔐 CONFIGURAZIONE ADMIN")
print("=" * 70)
print()

try:
    from config.auth import get_auth_config
    
    print("📝 Caricamento configurazione...")
    auth_config = get_auth_config()
    
    print(f"\n✅ Configurazione caricata!")
    print(f"\n📧 Email admin configurate:")
    if auth_config.admin_emails:
        for i, email in enumerate(auth_config.admin_emails, 1):
            print(f"   {i}. {email}")
    else:
        print("   ⚠️  Nessuna email admin configurata!")
    
    print(f"\n🔍 Test verifica email:")
    test_emails = [
        "danielemoltisanti@gmail.com",
        "DANIELEMOLTISANTI@GMAIL.COM",  # Test case-insensitive
        "test@example.com"
    ]
    
    for email in test_emails:
        is_admin = auth_config.is_admin_email(email)
        symbol = "✅" if is_admin else "❌"
        status = "ADMIN" if is_admin else "NON ADMIN"
        print(f"   {symbol} {email:<40} -> {status}")
    
    print("\n" + "=" * 70)
    print("📋 PROSSIMI PASSI:")
    print("=" * 70)
    print()
    print("1. Se la tua email è nella lista admin:")
    print("   - Fai LOGOUT dal frontend")
    print("   - Fai LOGIN di nuovo")
    print("   - Il sistema ti assegnerà automaticamente il ruolo admin")
    print()
    print("2. Se la tua email NON è nella lista:")
    print("   - Aggiungila a config.development.json sotto 'admin_emails'")
    print("   - Oppure imposta APP_AUTH_ADMIN_EMAILS nel file .env")
    print()
    print("3. Se hai già fatto login prima di configurare gli admin:")
    print("   - Esegui: python scripts/check_admin_user.py")
    print("   - Oppure elimina l'utente dal database e ri-fai il login")
    print()
    
except Exception as e:
    print(f"\n❌ Errore nel caricamento della configurazione:")
    print(f"   {e}")
    print()
    print("💡 Possibili cause:")
    print("   - Le dipendenze Python non sono installate")
    print("   - Il file di configurazione ha errori")
    print("   - La variabile d'ambiente non è impostata correttamente")
    import traceback
    print("\n📋 Traceback completo:")
    traceback.print_exc()
    sys.exit(1)

print("=" * 70)
print()
