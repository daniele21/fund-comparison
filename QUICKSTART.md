# 🚀 Quick Start: Abilitare Google OAuth + Telegram

## Passi Immediati

### 1. Configura Telegram Bot (5 minuti)

```bash
# 1. Apri Telegram e cerca @BotFather
# 2. Crea nuovo bot:
/newbot
# Nomina il bot (es: "FundComparisonBot")
# Ottieni il TOKEN: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# 3. Crea un canale/gruppo privato
# 4. Aggiungi il bot come amministratore
# 5. Invia un messaggio nel canale
# 6. Ottieni Chat ID:
curl https://api.telegram.org/bot<TUO_TOKEN>/getUpdates

# Cerca nell'output:
# "chat":{"id":-1001234567890}
```

### 2. Aggiorna Variabili d'Ambiente

Apri `.vscode/launch.json` e sostituisci nella configurazione **"Backend: FastAPI (Google + Invite Code)"**:

```json
"TELEGRAM_BOT_TOKEN": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
"TELEGRAM_CHAT_ID": "-1001234567890"
```

### 3. Avvia con Nuova Configurazione

```bash
# In VS Code:
1. Debug Panel (⇧⌘D)
2. Seleziona "Backend: FastAPI (Google + Invite Code)"
3. Premi F5

# ✅ Dovresti vedere:
# "Firebase Admin SDK initialized"
# "Admin notifications disabled: Telegram not configured" (se token mancante)
# O "Admin notifications enabled" (se configurato)
```

### 4. Testa Login Google

```bash
# Terminal 1: Backend già avviato
# Terminal 2: Frontend
cd app/frontend
pnpm dev

# Browser:
# 1. Vai su http://localhost:3000
# 2. Click "Login con Google"
# 3. Completa OAuth
# 4. Verifica Telegram: Ricevi notifica nuovo utente!
```

## Configurazioni Disponibili

### 🌟 Google + Invite Code (RACCOMANDATO)
- ✅ Login Google OAuth
- ✅ Codici invito (7712, 8012, 8322)
- ✅ Firebase Authentication
- ✅ Firestore
- ✅ Notifiche Telegram

### 📝 Solo Invite Code
- ✅ Accesso rapido con codici
- ❌ No Google OAuth
- ❌ No Firestore (dati in memoria)
- ❌ No Telegram

### 🔓 No Auth
- ✅ Accesso libero (sviluppo UI)
- ❌ Nessuna protezione

## Verifica Installazione

```bash
# 1. Firebase Admin installato?
pip list | grep firebase-admin
# Dovrebbe mostrare: firebase-admin 6.4.x

# Se non installato:
pip install firebase-admin

# 2. Credentials esistono?
ls -la /Users/moltisantid/Personal/fund-comparison/app/firestore-access.json

# 3. Variabili configurate?
# Nel launch.json cerca:
# - TELEGRAM_BOT_TOKEN
# - TELEGRAM_CHAT_ID
# - APP_GOOGLE_CLIENT_ID
# - APP_GOOGLE_CLIENT_SECRET
```

## Test Completo

### Scenario 1: Nuovo Utente Google

```
1. Login con Google → Crea profilo (status: pending)
2. Verifica Telegram → Ricevi notifica
3. Come admin → Vai su /admin/users/pending
4. Approva utente → Status: active, Roles: [subscriber]
5. Verifica Telegram → Ricevi conferma approvazione
6. Utente refresh → Accesso completo
```

### Scenario 2: Invite Code (no notifiche)

```
1. Login con codice 7712
2. Accesso immediato con plan: full-access
3. NO notifica Telegram (accesso diretto)
```

## Troubleshooting Rapido

### ❌ Backend non parte

```bash
# Verifica PYTHONPATH
cd /Users/moltisantid/Personal/fund-comparison
source .venv/bin/activate
export PYTHONPATH="${PYTHONPATH}:${PWD}:${PWD}/app:${PWD}/app/backend"

# Avvia manualmente
cd app
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

### ❌ "Firebase not initialized"

```bash
# Installa firebase-admin
pip install firebase-admin

# Verifica che la configurazione abbia:
"APP_FIREBASE_AUTH_ENABLED": "true"
```

### ❌ "Telegram not configured"

```bash
# Nel launch.json, sostituisci:
"TELEGRAM_BOT_TOKEN": "YOUR_TELEGRAM_BOT_TOKEN"  ← CAMBIA QUESTO
"TELEGRAM_CHAT_ID": "YOUR_TELEGRAM_CHAT_ID"      ← E QUESTO
```

### ❌ Google OAuth fallisce

```bash
# Verifica redirect URI in Google Console:
# Deve includere: http://127.0.0.1:8001/auth/google/callback
# E: http://localhost:3000 (per frontend)
```

## Prossimi Sviluppi

- [ ] Dashboard admin frontend
- [ ] Integrazione Stripe per pagamenti
- [ ] Email di conferma utente (opzionale)
- [ ] Rate limiting su API
- [ ] Logging strutturato
- [ ] Metriche e analytics

## Documentazione Completa

- `docs/ROLE_MANAGEMENT.md` - Sistema ruoli e permessi
- `docs/AUTH_AND_NOTIFICATIONS.md` - Guida completa auth + Telegram
- `docs/CONFIGURATION.md` - Tutte le variabili d'ambiente

## Supporto

In caso di problemi:
1. Verifica log backend in console
2. Controlla network tab in browser DevTools
3. Testa endpoint API con curl/Postman
4. Verifica che Firestore e Firebase siano attivi

## Comandi Utili

```bash
# Backend log in tempo reale
tail -f app/backend/logs/app.log

# Test API admin (con token)
export ADMIN_TOKEN="Bearer $(curl -s http://localhost:8001/auth/test-token | jq -r .token)"
curl -H "Authorization: $ADMIN_TOKEN" http://localhost:8001/api/admin/users/pending

# Test Telegram manualmente
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"<CHAT_ID>","text":"Test notifica 🎉"}'
```
