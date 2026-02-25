# Configurazione Autenticazione e Notifiche

## Metodi di Autenticazione Disponibili

Il sistema supporta **3 modalità** di autenticazione:

### 1. Solo Google OAuth (`google`)
Autenticazione tramite account Google con gestione ruoli e approvazioni admin.

### 2. Solo Codice Invito (`invite_code`)
Accesso rapido tramite codici predefiniti (7712, 8012, 8322).

### 3. Google OAuth + Codice Invito (`google` + invite codes)
**Modalità raccomandata**: Supporta entrambi i metodi contemporaneamente.

## Configurazioni VS Code Launch

### 🚀 Backend: FastAPI (Google + Invite Code) - **RACCOMANDATO**

Questa è la configurazione **più completa** che abilita:
- ✅ Login con Google OAuth
- ✅ Login con codici invito (7712, 8012, 8322)
- ✅ Firebase Authentication
- ✅ Firestore per dati utenti
- ✅ Notifiche Telegram per admin

**Per usarla:**
1. Vai su Debug Panel (⇧⌘D)
2. Seleziona "Backend: FastAPI (Google + Invite Code)"
3. Premi F5

### 📝 Backend: FastAPI (Invite Code)

Solo autenticazione tramite codici invito. Utile per test rapidi senza OAuth.

### 🌐 Backend: FastAPI (Google OAuth)

Solo autenticazione Google. Ideale per testare il flusso OAuth isolatamente.

### 🔓 Backend: FastAPI (No Auth)

Nessuna autenticazione. Per sviluppo UI o test API senza login.

## Notifiche Telegram

### Configurazione

Le notifiche Telegram vengono inviate automaticamente all'admin quando:

1. **Nuovo utente registrato** (via Google OAuth)
   - Status: `pending`
   - Richiede approvazione admin

2. **Utente approvato**
   - Admin approva l'utente
   - Utente ottiene accesso completo

3. **Utente rifiutato**
   - Admin rifiuta la richiesta
   - Include motivo del rifiuto

4. **Utente sospeso**
   - Admin sospende temporaneamente
   - Include motivo sospensione

5. **Utente riattivato**
   - Admin riattiva utente sospeso

### Setup Telegram Bot

#### 1. Crea il Bot

```bash
# Parla con @BotFather su Telegram
/newbot
# Segui le istruzioni e ottieni il TOKEN
```

#### 2. Ottieni Chat ID

```bash
# Crea un canale/gruppo Telegram
# Aggiungi il bot come admin
# Invia un messaggio, poi:

curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
# Cerca "chat":{"id":-1234567890}
```

#### 3. Configura Variabili d'Ambiente

Aggiungi al `.env.development` o alla configurazione launch:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

**Oppure** aggiorna il launch.json (già fatto!):

```json
"env": {
  "TELEGRAM_BOT_TOKEN": "YOUR_TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID": "YOUR_TELEGRAM_CHAT_ID"
}
```

### Formato Notifiche

#### Nuovo Utente Pending
```
🆕 **NUOVO UTENTE DA APPROVARE**

👤 **Nome:** Mario Rossi
📧 **Email:** mario.rossi@example.com
🆔 **User ID:** `google_123456`
📅 **Registrato:** 24/02/2026 10:30

💳 **Pagamento:**
   • Importo: €49.00
   • ID: `pi_1234567890`
   • Data: 24/02/2026

⚠️ **Azione richiesta:** Approva o rifiuta l'utente dalla dashboard admin

🔗 Dashboard: http://localhost:3000/admin
```

#### Utente Approvato
```
✅ **UTENTE APPROVATO**

👤 **Nome:** Mario Rossi
📧 **Email:** mario.rossi@example.com
🆔 **User ID:** `google_123456`

✨ **Nuovo Status:** active
🎯 **Ruolo:** subscriber
👨‍💼 **Approvato da:** Admin (admin_001)
```

## Variabili d'Ambiente Chiave

### Autenticazione

```bash
# Modalità auth
APP_AUTH_MODE=google  # o "invite_code" o "none"

# Google OAuth
APP_GOOGLE_CLIENT_ID=your-client-id
APP_GOOGLE_CLIENT_SECRET=your-client-secret

# Invite Codes (opzionale, funziona anche con google)
APP_AUTH_INVITE_CODES=7712,8012,8322
APP_AUTH_INVITE_PLAN=full-access

# JWT
APP_JWT_SECRET_KEY=your-secret-key-min-32-chars
APP_JWT_ALGORITHM=HS256
APP_JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# URLs
APP_BASE_URL=http://127.0.0.1:8001
APP_FRONTEND_BASE_URL=http://localhost:3000
```

### Firebase/Firestore

```bash
# Firebase Auth
APP_FIREBASE_AUTH_ENABLED=true

# Firestore
APP_FIRESTORE_ENABLED=true
APP_FIRESTORE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

### Telegram

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

## Flusso Utente Completo

### 1. Registrazione (Google OAuth)

```
Utente → Login Google → Backend crea profilo
                      → Status: "pending"
                      → Roles: ["free"]
                      → 🔔 Notifica Telegram ad Admin
```

### 2. Pagamento Stripe

```
Utente → Checkout Stripe → Webhook Backend
                         → Aggiorna payment_intent_id
                         → Status rimane "pending"
                         → 🔔 Notifica Telegram con info pagamento
```

### 3. Approvazione Admin

```
Admin → Dashboard → Vede utente pending
                 → Click "Approva"
                 → Status: "active"
                 → Roles: ["subscriber"]
                 → Plan: "full-access"
                 → 🔔 Notifica Telegram conferma
```

### 4. Accesso Utente

```
Utente → Refresh page → JWT aggiornato con nuovi ruoli
                      → Accesso completo a tutte le feature
```

## Testare il Sistema

### 1. Avvia Backend

```bash
# Seleziona "Backend: FastAPI (Google + Invite Code)" in VS Code
# Oppure da terminale:
cd /Users/moltisantid/Personal/fund-comparison
source .venv/bin/activate
cd app
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

### 2. Avvia Frontend

```bash
cd app/frontend
pnpm dev
```

### 3. Test Google Login

```
1. Vai su http://localhost:3000
2. Click "Login con Google"
3. Seleziona account Google
4. Verifica console backend: "Firestore profile upserted... status=pending"
5. Verifica Telegram: Dovresti ricevere notifica nuovo utente
```

### 4. Test Approvazione

```
1. Vai su http://localhost:3000/admin (come admin)
2. Vedi lista utenti pending
3. Click "Approva" su utente
4. Verifica Telegram: Notifica approvazione
5. Utente refresha → ha accesso completo
```

### 5. Test Invite Code

```
1. Vai su http://localhost:3000
2. Click "Login con codice"
3. Inserisci: 7712 (o 8012, 8322)
4. Accesso immediato con plan: "full-access"
5. NO notifica Telegram (accesso diretto)
```

## Troubleshooting

### ❌ "Telegram not configured"

**Problema**: Variabili Telegram non impostate

**Soluzione**:
```bash
# Verifica variabili
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID

# Se vuote, aggiungi a launch.json o .env
```

### ❌ "Firebase Admin SDK not initialized"

**Problema**: Firebase non inizializzato

**Soluzione**:
```bash
# Verifica che firebase_admin sia installato
pip install firebase-admin

# Verifica credenziali
ls -la /Users/moltisantid/Personal/fund-comparison/app/firestore-access.json

# Verifica env
echo $GOOGLE_APPLICATION_CREDENTIALS
```

### ❌ "Google OAuth fails"

**Problema**: Client ID/Secret non validi

**Soluzione**:
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. API & Services → Credentials
3. Verifica OAuth 2.0 Client IDs
4. Redirect URI deve includere: `http://127.0.0.1:8001/auth/google/callback`
5. Copia Client ID e Secret corretti

### ❌ "Status remains 'pending' after approval"

**Problema**: JWT non aggiornato

**Soluzione**:
```javascript
// Frontend: Forza refresh del token
// Oppure logout/login
localStorage.clear();
window.location.reload();
```

### ❌ Telegram riceve messaggi ma senza formattazione

**Problema**: Bot non supporta Markdown

**Soluzione**:
```python
# In admin_notification_service.py
# Cambia parse_mode da "Markdown" a "HTML"
await self._send_message(message, parse_mode="HTML")
```

## API Endpoints

### Admin - Gestione Utenti

```bash
# Lista utenti pending
GET /api/admin/users/pending
Authorization: Bearer <admin_token>

# Approva utente
POST /api/admin/users/approve
{
  "user_id": "google_123456",
  "action": "approve"
}

# Rifiuta utente
POST /api/admin/users/approve
{
  "user_id": "google_123456",
  "action": "reject",
  "reason": "Invalid payment"
}

# Sospendi utente
POST /api/admin/users/suspend
{
  "user_id": "google_123456",
  "reason": "Terms violation"
}

# Riattiva utente
POST /api/admin/users/reactivate?user_id=google_123456
```

## Sicurezza

### Best Practices

1. **Mai committare secrets**
   ```bash
   # Aggiungi a .gitignore
   .env*
   firestore-access.json
   ```

2. **Usa variabili d'ambiente in produzione**
   ```bash
   # GCP Cloud Run / K8s secrets
   kubectl create secret generic app-secrets \
     --from-literal=TELEGRAM_BOT_TOKEN=xxx \
     --from-literal=GOOGLE_CLIENT_SECRET=xxx
   ```

3. **Limita permessi Bot Telegram**
   - Solo permesso "Send Messages"
   - Non serve "Read Messages"

4. **Monitora log**
   ```bash
   # Verifica notifiche inviate
   tail -f app/backend/logs/app.log | grep "Telegram"
   ```

## Migrazione da Email a Telegram

### Vantaggi Telegram vs Email

| Feature | Email | Telegram |
|---------|-------|----------|
| Velocità | ~30s | < 1s |
| Rate Limits | Restrittivi | Generosi |
| Formato | HTML limitato | Markdown/HTML |
| Notifiche | Dipende client | Push real-time |
| Setup | SMTP complesso | Token semplice |
| Costi | Provider ($) | Gratis |
| Debugging | Difficile | Facile (getUpdates) |

### Se vuoi mantenere anche Email

```python
# services/notification_service.py

class NotificationService:
    def __init__(self):
        self.telegram = AdminNotificationService()
        self.email = EmailService()  # Opzionale
    
    async def notify_new_user(self, user):
        # Telegram (primario)
        await self.telegram.notify_new_pending_user(user)
        
        # Email (backup opzionale)
        if self.email.enabled:
            await self.email.send_new_user_notification(user)
```

## Monitoraggio

### Dashboard Telegram Stats

```bash
# Endpoint per statistiche notifiche
GET /api/admin/notifications/stats

Response:
{
  "total_sent": 156,
  "by_type": {
    "new_user": 45,
    "approved": 40,
    "rejected": 5,
    "suspended": 3,
    "reactivated": 3
  },
  "last_24h": 12,
  "failed": 2
}
```

## Prossimi Passi

1. ✅ Autenticazione Google OAuth + Invite Code
2. ✅ Sistema ruoli (free, subscriber, admin)
3. ✅ Notifiche Telegram per admin
4. 🔄 Dashboard admin frontend
5. 🔄 Stripe webhook per pagamenti
6. 🔄 Email utente dopo approvazione (opzionale)
7. 🔄 Analytics e metriche utenti
