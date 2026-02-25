#!/usr/bin/env python3
"""
Script per verificare e aggiornare il ruolo admin di un utente.
"""

import sys
import os
import asyncio

# Aggiungi il path del backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app', 'backend'))

from services.user_service import get_user_by_email, update_user
from schemas.user import UserProfileUpdate

async def check_and_fix_admin():
    """Verifica e corregge il ruolo admin per danielemoltisanti@gmail.com"""
    
    admin_email = "danielemoltisanti@gmail.com"
    
    print(f"🔍 Cercando utente con email: {admin_email}")
    print("-" * 60)
    
    try:
        # Ottieni l'utente dal database
        user = await get_user_by_email(admin_email)
        
        if not user:
            print(f"❌ Utente con email {admin_email} NON trovato nel database")
            print("\n💡 L'utente sarà creato automaticamente al prossimo login")
            print("   con ruolo admin, status active e piano full-access")
            return False
        
        print(f"✅ Utente trovato!")
        print(f"\n📊 Stato attuale:")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Nome: {user.name}")
        print(f"   Piano: {user.plan}")
        print(f"   Status: {user.status}")
        print(f"   Ruoli: {user.roles}")
        
        # Verifica se è admin
        is_admin = "admin" in (user.roles or [])
        
        if is_admin:
            print(f"\n✅ L'utente HA GIÀ il ruolo admin!")
            if user.status == "active" and user.plan == "full-access":
                print("✅ Status e piano sono corretti!")
                return True
            else:
                print(f"⚠️  Ma status o piano non sono corretti:")
                print(f"   Status: {user.status} (dovrebbe essere 'active')")
                print(f"   Piano: {user.plan} (dovrebbe essere 'full-access')")
        else:
            print(f"\n❌ L'utente NON ha il ruolo admin!")
            print(f"   Ruoli attuali: {user.roles}")
        
        # Chiedi se correggere
        print(f"\n🔧 Vuoi aggiornare l'utente per renderlo admin? (y/n): ", end='')
        response = input().strip().lower()
        
        if response != 'y':
            print("❌ Operazione annullata")
            return False
        
        # Aggiorna l'utente
        print("\n⚙️  Aggiornamento in corso...")
        update_data = UserProfileUpdate(
            roles=["admin"],
            status="active",
            plan="full-access"
        )
        
        updated_user = await update_user(user.id, update_data)
        
        print("\n✅ Utente aggiornato con successo!")
        print(f"\n📊 Nuovo stato:")
        print(f"   Piano: {updated_user.plan}")
        print(f"   Status: {updated_user.status}")
        print(f"   Ruoli: {updated_user.roles}")
        
        print("\n" + "=" * 60)
        print("✅ Fatto! Ora effettua il logout e ri-fai il login per vedere i cambiamenti")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🔐 VERIFICA E CORREZIONE RUOLO ADMIN")
    print("=" * 60)
    print()
    
    try:
        result = asyncio.run(check_and_fix_admin())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Operazione interrotta dall'utente")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Errore fatale: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
