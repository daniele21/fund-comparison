# Sistema Completo di Gestione Ruoli e Notifiche

## 📋 Panoramica dell'Implementazione

Abbiamo implementato un sistema completo di gestione utenti con 3 ruoli, autenticazione Firebase, storage Firestore e notifiche Telegram.

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  - Login Google OAuth                                       │
│  - UI role-based (free/subscriber/admin)                   │
│  - Gestione status (pending/active/suspended)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Auth System     │  │  Role Guards     │               │
│  │  - JWT tokens    │  │  - require_roles │               │
│  │  - Session mgmt  │  │  - permissions   │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Routes          │  │  Services        │               │
│  │  - /funds        │  │  - user_service  │               │
│  │  - /simulator    │  │  - notification  │               │
│  │  - /admin        │  │  - payment       │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│  Firebase   │    │    Firestore     │    │  Telegram   │
│    Auth     │    │  (User Data)     │    │   Channel   │
│  - Google   │    │  - Roles         │    │  - Notifiche│
│  - OAuth    │    │  - Status        │    │    admin    │
│  - Tokens   │    │  - Metadata      │    │             │
└─────────────┘    └──────────────────┘    └─────────────┘
```

## 👥 Ruoli Utente

### 1. **Free User** (Utente Gratuito)
```
Role: "free"
Status: "active" (automatico)
Accesso:
  ✅ Guide e FAQ
  ✅ Primi 10 fondi
  ❌ Confronto completo
  ❌ Simulatore
  ❌ Analisi avanzate
```

### 2. **Subscriber** (Abbonato)
```
Role: "subscriber"
Status: "pending" → "active" (dopo approvazione admin)
Accesso:
  ✅ Tutti i fondi
  ✅ Confronto illimitato
  ✅ Simulatore previdenziale
  ✅ Analisi personalizzate
  ✅ Download report
```

### 3. **Admin** (Amministratore)
```
Role: "admin"
Status: "active"
Accesso:
  ✅ Tutte le funzionalità subscriber
  ✅ Dashboard admin
  ✅ Approvazione utenti
  ✅ Gestione utenti
  ✅ Statistiche
```

## 🔐 Sistema di Autenticazione

### Stack Tecnologico
- **Firebase Authentication**: Gestione OAuth e tokens
- **Firestore**: Storage dati utente (profili, ruoli, status)
- **JWT**: Session tokens per API

### Flow di Login

```
1. User click "Login con Google"
   ↓
2. Google OAuth (popup)
   ↓
3. Frontend riceve authorization code
   ↓
4. POST /api/auth/google/exchange (code)
   ↓
5. Backend:
   - Verifica token con Firebase Auth
   - Crea/aggiorna profilo in Firestore
   - Genera session JWT
   - Imposta cookie HttpOnly
   ↓
6. Frontend riceve user data con ruolo e status
```

### Protezione Routes

```python
# Esempio 1: Solo autenticati
@router.get("/profile")
async def get_profile(claims: AuthClaims = Depends(auth_required)):
    return {"user": claims.sub}

# Esempio 2: Solo admin
@router.get("/admin/users")
async def list_users(claims: AuthClaims = Depends(require_roles("admin"))):
    return {"users": [...]}

# Esempio 3: Abbonamento attivo richiesto
@router.get("/simulator")
async def simulator(claims: AuthClaims = Depends(require_active_subscription())):
    return {"access": "granted"}

# Esempio 4: Permesso specifico
@router.post("/funds/compare")
async def compare(claims: AuthClaims = Depends(require_permission(Permission.COMPARE_FUNDS))):
    return {"comparison": [...]}
```

## 📨 Sistema di Notifiche Telegram

### Eventi Notificati

1. **🆕 Nuovo utente pending** (dopo registrazione/pagamento)
2. **✅ Utente approvato** (admin approva)
3. **❌ Utente rifiutato** (admin rifiuta)
4. **🚫 Utente sospeso** (admin sospende)
5. **♻️ Utente riattivato** (admin riattiva)
6. **💰 Pagamento ricevuto** (Stripe webhook)
7. **⚠️ Alert di sistema** (errori critici)
8. **📊 Report giornaliero** (opzionale)

### Configurazione

```bash
# .env
APP_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
APP_TELEGRAM_CHAT_ID=-1001234567890
```

### Esempio Notifica

```
🆕 **NUOVO UTENTE DA APPROVARE**

👤 **Nome:** Mario Rossi
📧 **Email:** mario.rossi@example.com
🆔 **User ID:** `google_123456`
📅 **Registrato:** 24/02/2026 10:30

💳 **Pagamento:**
   • Importo: €99.00
   • ID: `pi_123456789`

⚠️ **Azione richiesta:** Approva dalla dashboard

🔗 https://yourdomain.com/admin/users
```

## 🛣️ API Endpoints

### Autenticazione
```
GET  /api/auth/google/config        - Config OAuth
POST /api/auth/google/exchange      - Exchange code → session
POST /api/auth/google/refresh       - Refresh token
POST /api/auth/logout               - Logout
```

### Fondi Pensione (Role-based)
```
GET  /api/funds/list                - Lista fondi (free: max 10)
GET  /api/funds/{id}                - Dettaglio fondo
POST /api/funds/compare             - Confronto (subscriber+)
POST /api/funds/analysis/{id}       - Analisi fondo (subscriber+)
GET  /api/funds/recommendations     - Raccomandazioni (subscriber+)
```

### Simulatore (Subscriber only)
```
POST /api/simulator/calculate       - Calcolo simulazione
GET  /api/simulator/parameters      - Parametri default
POST /api/simulator/save            - Salva simulazione
GET  /api/simulator/history         - Storico simulazioni
```

### Guide e FAQ (Public)
```
GET  /api/content/guide             - Lista sezioni guida
GET  /api/content/guide/{slug}      - Sezione specifica
GET  /api/content/faq               - FAQ (con filtri)
GET  /api/content/glossary          - Glossario termini
GET  /api/content/search            - Ricerca contenuti
```

### Admin (Admin only)
```
GET    /api/admin/users/pending     - Lista utenti pending
GET    /api/admin/users             - Lista tutti utenti
GET    /api/admin/users/{id}        - Dettaglio utente
POST   /api/admin/users/approve     - Approva/rifiuta
POST   /api/admin/users/suspend     - Sospendi utente
POST   /api/admin/users/reactivate  - Riattiva utente
DELETE /api/admin/users/{id}        - Elimina utente
GET    /api/admin/users/stats       - Statistiche
```

## 🗃️ Database Schema (Firestore)

### Collection: `users`

```typescript
{
  // Identità
  id: string,                    // Firebase Auth UID
  email: string,
  name?: string,
  picture?: string,
  hd?: string,                   // Google Workspace domain
  
  // Autorizzazioni
  roles: string[],               // ["free"] | ["subscriber"] | ["admin"]
  plan: string,                  // "free" | "full-access"
  status: string,                // "pending" | "active" | "suspended" | "rejected"
  
  // Risorse
  credits: number,
  
  // Pagamento
  payment_intent_id?: string,    // Stripe reference
  
  // Metadata
  metadata?: {
    provider: "google",
    email_verified: boolean,
    
    // Approvazione
    approved_at?: string,
    approved_by?: string,
    rejected_at?: string,
    rejected_by?: string,
    rejection_reason?: string,
    
    // Sospensione
    suspended_at?: string,
    suspended_by?: string,
    suspension_reason?: string,
    reactivated_at?: string,
    reactivated_by?: string,
    
    // Pagamento
    payment_date?: string,
    payment_amount?: number,
  },
  
  // Timestamp
  created_at: string,            // ISO 8601
  updated_at: string,
  last_login_at?: string
}
```

## 🔒 Role Guards

### Dependency Injection

```python
from backend.auth import (
    auth_required,              # Solo autenticati
    require_roles,              # Ruoli specifici
    require_permission,         # Permessi granulari
    require_active_subscription,# Abbonamento attivo
    optional_auth,              # Autenticazione opzionale
)

# Uso
@router.get("/protected")
async def route(claims: AuthClaims = Depends(auth_required)):
    pass

@router.get("/admin-only")
async def route(claims: AuthClaims = Depends(require_roles("admin"))):
    pass

@router.get("/premium")
async def route(claims: AuthClaims = Depends(require_active_subscription())):
    pass
```

### RoleGuard Helper

```python
from backend.auth import role_guard

user_profile = await user_service.get_user_by_id(user_id)

# Check ruolo
if role_guard.has_role(user_profile, "admin"):
    # Admin logic

# Check status
if role_guard.is_pending(user_profile):
    # Show pending message

# Check permesso
if role_guard.can_access(user_profile, Permission.USE_SIMULATOR):
    # Grant access

# Oppure solleva eccezione automatica
role_guard.require_active_subscription_or_raise(user_profile)
```

## 📝 Flusso Completo Utente

### 1. Primo Login (Free)
```
1. User fa login con Google
   → Firebase Auth autentica
   → Backend crea profilo in Firestore
   → Ruolo: "free", Status: "pending"
   → Notifica Telegram: "Nuovo utente registrato"

2. User esplora app
   ✅ Accede a guida e FAQ
   ✅ Vede primi 10 fondi
   ❌ Simulatore bloccato (upgrade richiesto)
```

### 2. Upgrade a Subscriber
```
1. User click "Upgrade"
   → Redirect a Stripe Checkout

2. Pagamento completato
   → Stripe webhook → Backend
   → Aggiorna Firestore:
      * payment_intent_id salvato
      * Status resta "pending"
   → Notifica Telegram: "Pagamento ricevuto €99"

3. User aspetta approvazione
   → Status: "pending"
   → Messaggio UI: "In attesa di approvazione"
   → Accesso: solo free features
```

### 3. Admin Approva
```
1. Admin riceve notifica Telegram
   → Apre dashboard admin
   → Vede lista "Pending Users"

2. Admin click "Approve"
   → POST /api/admin/users/approve
   → Backend aggiorna Firestore:
      * Status: "active"
      * Roles: ["subscriber"]
      * Plan: "full-access"
   → Notifica Telegram: "Utente approvato"

3. User refresha pagina
   → Status: "active"
   → Accesso completo sbloccato
   ✅ Simulatore
   ✅ Confronto fondi
   ✅ Tutte le features
```

## 🚀 Deployment Checklist

### Variabili d'Ambiente

```bash
# Firebase
FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json
APP_FIREBASE_AUTH_ENABLED=true
APP_FIRESTORE_ENABLED=true

# JWT
APP_JWT_SECRET=your-super-secret-key-32-chars-min
APP_JWT_ALGORITHM=HS256
APP_JWT_EXPIRE_MINUTES=60

# Telegram
APP_TELEGRAM_BOT_TOKEN=123456:ABC...
APP_TELEGRAM_CHAT_ID=-1001234567890

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS
APP_CORS_ORIGINS=https://yourdomain.com

# Primo Admin (opzionale)
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
```

### Security Checklist

- [ ] Firebase credentials protette (non in git)
- [ ] JWT secret strong (min 32 chars)
- [ ] HTTPS only in production
- [ ] Cookies: HttpOnly, Secure, SameSite
- [ ] Firestore security rules configurate
- [ ] Telegram bot token protetto
- [ ] Rate limiting abilitato
- [ ] CORS origins limitati

### Testing

```bash
# Test autenticazione
curl -X POST http://localhost:8000/api/auth/google/exchange \
  -H "Content-Type: application/json" \
  -d '{"code": "...", "state": "..."}'

# Test route protetta (free user)
curl http://localhost:8000/api/funds/list?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
# → Restituisce max 10 fondi

# Test route admin
curl http://localhost:8000/api/admin/users/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
# → Lista utenti pending
```

## 📚 Documentazione Completa

- `/docs/ROLE_MANAGEMENT.md` - Sistema ruoli e permessi
- `/docs/TELEGRAM_SETUP.md` - Setup notifiche Telegram
- `/docs/FIREBASE_SETUP.md` - Configurazione Firebase (da creare)
- `/app/backend/auth/README.md` - Documentazione auth system

## 🛠️ File Chiave Creati/Modificati

### Nuovi File

```
app/backend/
├── auth/
│   ├── roles.py                 # Enum ruoli, status, permessi
│   └── guards.py                # Role guards e helpers
├── providers/
│   └── firebase_auth.py         # Provider Firebase Auth
├── routes/
│   ├── admin.py                 # Endpoint admin
│   ├── funds.py                 # Endpoint fondi (role-based)
│   ├── simulator.py             # Endpoint simulatore
│   └── content.py               # Guide e FAQ
├── services/
│   └── admin_notification_service.py  # Notifiche Telegram
└── schemas/
    └── user.py                  # Schema con status e payment_intent_id

docs/
├── ROLE_MANAGEMENT.md           # Documentazione sistema ruoli
└── TELEGRAM_SETUP.md            # Setup Telegram bot
```

### File Modificati

```
app/backend/
├── main.py                      # Registrazione nuove routes
├── requirements.txt             # firebase-admin aggiunto
├── auth/
│   ├── __init__.py             # Export guards e permessi
│   └── deps.py                 # Nuove dependencies
├── services/
│   └── user_service.py         # Notifiche integrate
└── repositories/
    └── user_repository.py      # Query per status
```

## 🎯 Next Steps

### Immediate
1. ✅ Installare `firebase-admin`: `pip install firebase-admin`
2. ✅ Configurare credenziali Firebase
3. ✅ Setup bot Telegram
4. ✅ Testare flow completo

### Short Term
- [ ] Frontend: UI per status pending
- [ ] Frontend: Admin dashboard
- [ ] Stripe webhook integration
- [ ] Email notifications (backup Telegram)
- [ ] Logging e monitoring

### Long Term
- [ ] Analytics utenti
- [ ] A/B testing
- [ ] Referral program
- [ ] Multi-language support
- [ ] Mobile app

## 💡 Tips

### Per Sviluppo Locale

```bash
# Usa Firestore Emulator
export APP_FIRESTORE_USE_EMULATOR=true
export FIRESTORE_EMULATOR_HOST=localhost:8080

# Disabilita Telegram in dev (opzionale)
unset APP_TELEGRAM_BOT_TOKEN
```

### Per Testing

```python
# Crea utente test admin
from backend.services import user_service

profile = UserProfileCreate(
    id="test_admin",
    email="admin@test.com",
    name="Test Admin",
    roles=["admin"],
    status="active",
    plan="full-access"
)
await user_service.upsert_user(profile)
```

### Per Debugging

```python
# Check user access level
from backend.auth.guards import get_user_access_level

access = await get_user_access_level(user_id)
print(access)
# → {
#     "role": "subscriber",
#     "status": "active",
#     "can_access_simulator": True,
#     ...
#   }
```

## 🆘 Supporto

Per problemi o domande:
1. Controlla i log: `tail -f logs/app.log`
2. Verifica configurazione Firebase e Telegram
3. Testa endpoints con curl/Postman
4. Consulta documentazione in `/docs`

---

**Sistema implementato da:** GitHub Copilot  
**Data:** 24 Febbraio 2026  
**Versione:** 1.0.0
