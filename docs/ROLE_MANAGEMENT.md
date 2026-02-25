# Sistema di Gestione Ruoli e Autenticazione

## Architettura

Il sistema utilizza due servizi Firebase:

1. **Firebase Authentication**: Gestisce l'autenticazione Google OAuth, token JWT, sessioni
2. **Firestore**: Memorizza i dati utente (profili, ruoli, status, crediti, metadata)

## Ruoli Utente

### 1. Utente Free (`free`)
- **Status**: `active` (automatico al primo login)
- **Accesso**:
  - ✅ Guida previdenziale completa
  - ✅ FAQ TFR
  - ✅ Visualizzazione limitata fondi (primi 10)
  - ❌ Confronto completo fondi
  - ❌ Simulatore previdenziale
  - ❌ Analisi avanzata
  - ❌ Download report

### 2. Utente Abbonato (`subscriber`)
- **Status iniziale**: `pending` (dopo pagamento)
- **Status finale**: `active` (dopo approvazione admin)
- **Processo**:
  1. Utente effettua pagamento (Stripe)
  2. Sistema aggiorna `payment_intent_id` in Firestore
  3. Status diventa `pending`
  4. Admin approva manualmente l'utente
  5. Status diventa `active`, ruolo `subscriber`
- **Accesso completo** a tutte le funzionalità

### 3. Amministratore (`admin`)
- **Status**: `active`
- **Accesso**:
  - ✅ Tutte le funzionalità subscriber
  - ✅ Dashboard amministratore
  - ✅ Approvazione utenti pending
  - ✅ Gestione utenti (sospensione, riattivazione)
  - ✅ Visualizzazione statistiche
  - ✅ Gestione contenuti

## Stati Utente (`UserStatus`)

### `pending`
- Nuovo utente dopo registrazione/pagamento
- In attesa di approvazione admin
- Accesso solo a funzionalità free

### `active`
- Utente approvato e attivo
- Accesso completo in base al ruolo

### `suspended`
- Utente temporaneamente sospeso dall'admin
- Nessun accesso (tranne logout)
- Può essere riattivato

### `rejected`
- Richiesta di abbonamento rifiutata
- Torna a utente free
- Può richiedere nuovamente

## Flusso di Autenticazione

### Login con Google

```
1. Frontend → Google OAuth (popup)
2. Google → Callback con authorization code
3. Frontend → POST /api/auth/google/exchange
4. Backend:
   - Verifica token con Firebase Auth
   - Crea/aggiorna profilo in Firestore
   - Imposta ruolo: "free", status: "pending"
   - Crea session JWT con ruoli e status
   - Imposta cookie HttpOnly
5. Frontend riceve user info con ruoli e status
```

### Primo Login (Nuovo Utente)

```python
# In Firestore viene creato:
{
  "id": "google_user_id",
  "email": "user@example.com",
  "name": "User Name",
  "roles": ["free"],
  "plan": "free",
  "status": "pending",
  "credits": 0,
  "created_at": "2026-02-24T10:00:00Z",
  "last_login_at": "2026-02-24T10:00:00Z"
}
```

## Flusso di Upgrade e Approvazione

### 1. Utente Richiede Upgrade

```
1. User click "Upgrade to Pro"
2. Frontend → Stripe Checkout
3. Pagamento completato
4. Stripe webhook → Backend
5. Backend:
   - Verifica pagamento
   - Aggiorna Firestore:
     * status = "pending"
     * payment_intent_id = "pi_xxx"
     * metadata.payment_date = timestamp
6. Notifica admin (email/dashboard)
```

### 2. Admin Approva Utente

```
1. Admin visualizza dashboard pending users
2. Admin click "Approve"
3. Frontend → POST /api/admin/users/approve
4. Backend:
   - Verifica token admin
   - Aggiorna Firestore:
     * status = "active"
     * roles = ["subscriber"]
     * plan = "full-access"
     * metadata.approved_at = timestamp
     * metadata.approved_by = admin_id
5. Opzionale: Invia email di conferma
6. User al prossimo refresh ha accesso completo
```

## API Endpoints

### Autenticazione

```
GET  /api/auth/google/config          - Config per Google OAuth
POST /api/auth/google/exchange        - Exchange code per session
POST /api/auth/google/refresh         - Refresh access token
POST /api/auth/logout                 - Logout utente
```

### Admin - Gestione Utenti

```
GET    /api/admin/users/pending       - Lista utenti pending
GET    /api/admin/users                - Lista tutti utenti
GET    /api/admin/users/{id}          - Dettagli utente
POST   /api/admin/users/approve       - Approva/rifiuta utente
POST   /api/admin/users/suspend       - Sospendi utente
POST   /api/admin/users/reactivate    - Riattiva utente
DELETE /api/admin/users/{id}          - Elimina utente
GET    /api/admin/users/stats/overview - Statistiche utenti
```

## Controllo Accessi nel Backend

### Dependency Injection

```python
from backend.auth import (
    auth_required,           # Solo autenticati
    require_roles,          # Richiede ruoli specifici
    require_permission,     # Richiede permessi specifici
    require_active_subscription,  # Richiede abbonamento attivo
)

# Esempio: Solo admin
@router.get("/admin/dashboard")
async def admin_dashboard(claims: AuthClaims = Depends(require_roles("admin"))):
    pass

# Esempio: Subscriber o Admin, con status active
@router.get("/simulator")
async def simulator(claims: AuthClaims = Depends(require_active_subscription())):
    pass

# Esempio: Permesso specifico
@router.get("/funds/compare")
async def compare_funds(claims: AuthClaims = Depends(require_permission(Permission.COMPARE_FUNDS))):
    pass
```

### Controllo Manuale

```python
from backend.auth.roles import can_access_feature, UserRole, UserStatus, Permission

# In una route
user_profile = await user_service.get_user_by_id(claims.sub)
user_role = UserRole.SUBSCRIBER if "subscriber" in user_profile.roles else UserRole.FREE
user_status = UserStatus(user_profile.status)

if not can_access_feature(user_role, user_status, Permission.USE_SIMULATOR):
    raise HTTPException(403, "Upgrade required")
```

## Frontend Integration

### Context/Hook per Gestione Utente

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  roles: string[];  // ["free"] | ["subscriber"] | ["admin"]
  plan: string;     // "free" | "full-access"
  status: string;   // "pending" | "active" | "suspended" | "rejected"
}

// Check accesso
function canAccessFeature(user: User, feature: string): boolean {
  if (user.status === "suspended" || user.status === "rejected") {
    return false;
  }
  
  if (user.status === "pending") {
    // Solo funzionalità free
    return ["guide", "faq", "limited-funds"].includes(feature);
  }
  
  if (user.roles.includes("admin")) {
    return true;  // Admin ha accesso a tutto
  }
  
  if (user.roles.includes("subscriber") && user.status === "active") {
    return true;  // Subscriber attivo ha accesso completo
  }
  
  // Free user
  return ["guide", "faq", "limited-funds"].includes(feature);
}
```

### UI Condizionale

```tsx
{user?.status === "pending" && (
  <Alert variant="warning">
    Il tuo abbonamento è in attesa di approvazione.
    Riceverai una email quando sarà attivato.
  </Alert>
)}

{user?.status === "suspended" && (
  <Alert variant="error">
    Il tuo account è stato sospeso. Contatta il supporto.
  </Alert>
)}

<Button
  disabled={!canAccessFeature(user, "simulator")}
  onClick={handleOpenSimulator}
>
  Apri Simulatore
  {user?.status === "pending" && " (In attesa approvazione)"}
</Button>
```

## Database Schema (Firestore)

### Collection: `users`

```typescript
interface UserDocument {
  // Identità
  id: string;                    // UID da Firebase Auth
  email: string;
  name?: string;
  picture?: string;
  hd?: string;                   // Google Workspace domain
  
  // Autorizzazioni
  roles: string[];               // ["free"] | ["subscriber"] | ["admin"]
  plan: string;                  // "free" | "full-access"
  status: string;                // "pending" | "active" | "suspended" | "rejected"
  
  // Risorse
  credits: number;               // Crediti disponibili
  
  // Pagamento
  payment_intent_id?: string;    // Stripe payment reference
  
  // Metadata
  metadata?: {
    provider: string;            // "google"
    given_name?: string;
    family_name?: string;
    locale?: string;
    email_verified: boolean;
    
    // Approvazione
    approved_at?: string;
    approved_by?: string;        // Admin user ID
    rejected_at?: string;
    rejected_by?: string;
    rejection_reason?: string;
    
    // Sospensione
    suspended_at?: string;
    suspended_by?: string;
    suspension_reason?: string;
    reactivated_at?: string;
    reactivated_by?: string;
    
    // Pagamento
    payment_date?: string;
    payment_amount?: number;
    payment_currency?: string;
  };
  
  // Timestamp
  created_at: string;            // ISO 8601
  updated_at: string;
  last_login_at?: string;
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }
    
    // Users collection
    match /users/{userId} {
      // Lettura: utente stesso o admin
      allow read: if isOwner(userId) || isAdmin();
      
      // Creazione: solo al primo login (tramite backend)
      allow create: if isOwner(userId);
      
      // Aggiornamento: solo admin può modificare roles/status
      allow update: if isOwner(userId) && 
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['roles', 'status', 'plan'])
        || isAdmin();
      
      // Eliminazione: solo admin
      allow delete: if isAdmin();
    }
  }
}
```

## Notifiche Email

### Eventi da Notificare

1. **Nuovo utente pending** → Email ad admin
2. **Utente approvato** → Email a utente
3. **Utente rifiutato** → Email a utente con motivo
4. **Utente sospeso** → Email a utente
5. **Utente riattivato** → Email a utente

### Template Email (Esempio)

```python
# services/email_service.py

async def send_approval_notification(user_email: str, user_name: str):
    subject = "Abbonamento Approvato! 🎉"
    body = f"""
    Ciao {user_name},
    
    Il tuo abbonamento è stato approvato!
    
    Ora hai accesso completo a:
    - Confronto illimitato fondi pensione
    - Simulatore previdenziale avanzato
    - Analisi personalizzate
    - Download report
    
    Accedi ora: https://yourdomain.com
    
    Team Fund Comparison
    """
    # Invia email
```

## Testing

### Test Utente Free

```bash
# Login
curl -X POST http://localhost:8000/api/auth/google/exchange \
  -H "Content-Type: application/json" \
  -d '{"code": "...", "state": "..."}'

# Accesso limitato
curl http://localhost:8000/api/funds?limit=10  # OK
curl http://localhost:8000/api/simulator       # 403 Forbidden
```

### Test Utente Pending

```bash
# Dopo pagamento, prima dell'approvazione
curl http://localhost:8000/api/simulator  # 402 Payment Required
# Messaggio: "Your subscription is pending admin approval"
```

### Test Admin

```bash
# Login come admin
export ADMIN_TOKEN="eyJ..."

# Lista utenti pending
curl http://localhost:8000/api/admin/users/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approva utente
curl -X POST http://localhost:8000/api/admin/users/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_123", "action": "approve"}'
```

## Deployment

### Variabili d'Ambiente

```bash
# Firebase
FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
APP_FIREBASE_AUTH_ENABLED=true
APP_FIRESTORE_ENABLED=true

# JWT
APP_JWT_SECRET=your-super-secret-key-min-32-chars
APP_JWT_ALGORITHM=HS256
APP_JWT_EXPIRE_MINUTES=60

# CORS
APP_CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Admin (primo admin)
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
```

### Inizializzazione

```python
# main.py
from backend.providers.firebase_auth import initialize_firebase_app

@app.on_event("startup")
async def startup():
    # Inizializza Firebase Admin SDK
    initialize_firebase_app()
    logger.info("Firebase initialized")
    
    # Crea primo admin se non esiste
    await create_initial_admin()
```

## Sicurezza

### Best Practices

1. **Token JWT**: Usa secret key forte (min 32 caratteri)
2. **Cookies**: HttpOnly, Secure (production), SameSite=Lax
3. **Firebase Rules**: Limita accesso a Firestore
4. **Rate Limiting**: Implementa su endpoint sensibili
5. **Audit Log**: Traccia azioni admin
6. **HTTPS Only**: Forza HTTPS in production
7. **Token Refresh**: Implementa refresh token rotation

### Revoca Accesso

```python
# Quando si sospende un utente
from backend.providers.firebase_auth import revoke_refresh_tokens

await revoke_refresh_tokens(user_id)
# Forza l'utente a rifare login
```

## Monitoraggio

### Metriche da Tracciare

- Numero utenti per status (pending, active, suspended)
- Tempo medio approvazione (payment → active)
- Tasso conversione (free → subscriber)
- Login giornalieri
- Utilizzo features per ruolo

### Dashboard Admin

```python
GET /api/admin/users/stats/overview
{
  "total": 150,
  "by_status": {
    "pending": 5,
    "active": 140,
    "suspended": 3,
    "rejected": 2
  },
  "by_role": {
    "free": 100,
    "subscriber": 48,
    "admin": 2
  },
  "pending_awaiting_approval": 5
}
```
