# Configurazione Notifiche Telegram per Admin

## Overview

Il sistema invia notifiche Telegram agli amministratori per:

- 🆕 **Nuovi utenti pending** (dopo registrazione/pagamento)
- ✅ **Utenti approvati**
- ❌ **Utenti rifiutati**
- 🚫 **Utenti sospesi**
- ♻️ **Utenti riattivati**
- 💰 **Pagamenti ricevuti**
- ⚠️ **Alert di sistema**
- 📊 **Report giornaliero** (opzionale)

## Setup Telegram Bot

### 1. Crea un Bot Telegram

1. Apri Telegram e cerca `@BotFather`
2. Invia il comando `/newbot`
3. Segui le istruzioni:
   - Scegli un nome per il bot (es: "Fund Comparison Admin Bot")
   - Scegli uno username (es: "fund_comparison_admin_bot")
4. BotFather ti darà un **token** (es: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. **Salva questo token** - lo userai nelle variabili d'ambiente

### 2. Crea un Canale o Gruppo Telegram

#### Opzione A: Canale Privato (Consigliato)

1. Crea un nuovo canale Telegram
2. Impostalo come **privato**
3. Dai un nome (es: "Fund Comparison Admin Notifications")
4. Aggiungi il bot come amministratore:
   - Vai nelle impostazioni del canale
   - Administrators → Add Administrator
   - Cerca il tuo bot e aggiungilo
   - Dai i permessi necessari (almeno "Post messages")

#### Opzione B: Gruppo Privato

1. Crea un nuovo gruppo
2. Aggiungi il bot al gruppo
3. Rendi il bot amministratore (opzionale ma consigliato)

### 3. Ottieni il Chat ID

Ci sono diversi modi per ottenere il Chat ID:

#### Metodo 1: API Telegram (Più Semplice)

1. Invia un messaggio al canale/gruppo
2. Visita questo URL (sostituisci `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Cerca `"chat":{"id":` nella risposta JSON
4. Il numero che segue è il tuo **Chat ID** (può essere negativo, es: `-1001234567890`)

#### Metodo 2: Bot di Test

1. Cerca `@userinfobot` su Telegram
2. Avvia il bot
3. Ti mostrerà il tuo User ID
4. Per canali/gruppi, aggiungi `@userinfobot` al canale/gruppo
5. Ti mostrerà il Chat ID del canale/gruppo

#### Metodo 3: Script Python

```python
import requests

BOT_TOKEN = "YOUR_BOT_TOKEN"
url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"

response = requests.get(url)
print(response.json())
```

Cerca il `chat.id` nell'output.

### 4. Configura le Variabili d'Ambiente

Aggiungi queste variabili al tuo file `.env` o al sistema:

```bash
# Telegram Bot Configuration
APP_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
APP_TELEGRAM_CHAT_ID=-1001234567890
```

**Note:**
- Il Chat ID può essere negativo (normale per canali/gruppi)
- Per gruppi privati, il Chat ID inizia tipicamente con `-100`
- Per canali, il formato è simile

### 5. Testa la Configurazione

Puoi testare le notifiche con questo script:

```python
# test_telegram.py
import asyncio
import httpx

async def test_telegram():
    token = "YOUR_BOT_TOKEN"
    chat_id = "YOUR_CHAT_ID"
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": "🎉 Test notifica da Fund Comparison Bot!",
        "parse_mode": "Markdown"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)
        print(response.json())

asyncio.run(test_telegram())
```

Se ricevi il messaggio su Telegram, la configurazione è corretta!

## Esempi di Notifiche

### Nuovo Utente Pending

```
🆕 **NUOVO UTENTE DA APPROVARE**

👤 **Nome:** Mario Rossi
📧 **Email:** mario.rossi@example.com
🆔 **User ID:** `google_123456`
📅 **Registrato:** 24/02/2026 10:30
🏢 **Workspace:** example.com

💳 **Pagamento:**
   • Importo: €99.00
   • ID: `pi_123456789`
   • Data: 24/02/2026

⚠️ **Azione richiesta:** Approva o rifiuta l'utente dalla dashboard admin

🔗 Dashboard: https://yourdomain.com/admin/users
```

### Utente Approvato

```
✅ **UTENTE APPROVATO**

👤 **Nome:** Mario Rossi
📧 **Email:** mario.rossi@example.com
🆔 **User ID:** `google_123456`

✅ **Approvato da:** Admin `admin_001`
📅 **Data:** 24/02/2026 11:00

L'utente ora ha accesso completo a tutte le funzionalità.
```

### Pagamento Ricevuto

```
💰 **PAGAMENTO RICEVUTO**

📧 **Email:** mario.rossi@example.com
💵 **Importo:** €99.00
🆔 **Payment ID:** `pi_123456789`
📅 **Data:** 24/02/2026 10:25

⚠️ Verifica l'utente e approva dalla dashboard admin.
```

## Integrazione nel Codice

### Inviare Notifiche Manualmente

```python
from backend.services.admin_notification_service import get_admin_notification_service

# Get service instance
notification_service = get_admin_notification_service()

# Notify new pending user
await notification_service.notify_new_pending_user(
    user=user_profile,
    payment_info={
        "amount": 99.00,
        "payment_id": "pi_123456789",
        "date": "24/02/2026"
    }
)

# Notify user approved
await notification_service.notify_user_approved(
    user=user_profile,
    approved_by=admin_user_id
)

# Send custom system alert
await notification_service.notify_system_alert(
    alert_type="Database Error",
    message="Connection timeout to Firestore",
    details={"error_code": "ETIMEDOUT", "retries": 3}
)
```

### Notifiche Automatiche

Le notifiche sono già integrate in:

- `user_service.upsert_user()` - Nuovi utenti
- `user_service.approve_user()` - Approvazioni
- `user_service.reject_user()` - Rifiuti
- `user_service.suspend_user()` - Sospensioni
- `user_service.reactivate_user()` - Riattivazioni

## Troubleshooting

### Bot non invia messaggi

1. **Verifica il token**: Controlla che sia corretto e attivo
2. **Verifica il Chat ID**: Assicurati che sia corretto (incluso il segno negativo)
3. **Controlla i permessi**: Il bot deve essere amministratore del canale/gruppo
4. **Test manuale**:
   ```bash
   curl -X POST "https://api.telegram.org/botYOUR_TOKEN/sendMessage" \
     -d "chat_id=YOUR_CHAT_ID" \
     -d "text=Test message"
   ```

### Errore "Chat not found"

- Il Chat ID è sbagliato
- Il bot non è stato aggiunto al canale/gruppo
- Il canale/gruppo è stato eliminato

### Errore "Bot was blocked by the user"

- Se usi un chat privato, assicurati di non aver bloccato il bot
- Usa un canale o gruppo invece

### Messaggi non formattati correttamente

- Verifica che `parse_mode="Markdown"` sia impostato
- Controlla la sintassi Markdown (usa `**testo**` per il grassetto)
- Alcuni caratteri speciali devono essere escaped

## Best Practices

### 1. Usa un Canale Dedicato

Crea un canale separato solo per le notifiche admin, non mescolare con altri contenuti.

### 2. Configura Notifiche Silenti (Opzionale)

Per notifiche non urgenti, puoi disabilitare il suono:

```python
body = {
    "chat_id": chat_id,
    "text": text,
    "disable_notification": True  # No sound/vibration
}
```

### 3. Filtra per Priorità

Puoi usare emoji diversi per diverse priorità:

- 🔴 **URGENTE**: Errori critici
- 🟡 **IMPORTANTE**: Nuovi utenti pending
- 🟢 **INFO**: Approvazioni, report

### 4. Rate Limiting

Telegram ha limiti:
- Max 30 messaggi/secondo per bot
- Max 20 messaggi/minuto per lo stesso chat

Il servizio gestisce automaticamente questi limiti.

### 5. Backup delle Notifiche

Considera di salvare anche le notifiche in un database per audit trail:

```python
# Log notifiche importanti
logger.info(f"Admin notification sent: {notification_type} for user {user_id}")
```

## Monitoraggio

### Dashboard Telegram Bot

1. Vai su BotFather
2. `/mybots`
3. Seleziona il tuo bot
4. `Bot Settings` → `Statistics` per vedere le metriche

### Log delle Notifiche

Le notifiche sono loggiate in `uvicorn.error`:

```bash
# Visualizza i log
tail -f logs/app.log | grep "Admin notification"
```

## Sicurezza

### Proteggi il Token

- **Non committare** il token nel codice
- Usa variabili d'ambiente o secret manager
- Revoca il token se compromesso (via BotFather `/revoke`)

### Limita l'Accesso al Canale

- Usa un canale **privato**
- Aggiungi solo admin fidati
- Non condividere il link di invito pubblicamente

### Validazione

Il servizio valida automaticamente:
- Presenza token e chat_id
- Formato messaggi
- Timeout connessioni

## Migliorie Future

### Report Schedulati

Aggiungi un cron job per report giornalieri:

```python
# cron job (daily at 9:00 AM)
from backend.services.admin_notification_service import get_admin_notification_service
from backend.services import user_service

async def send_daily_report():
    notification_service = get_admin_notification_service()
    
    # Get stats
    all_users, _ = await user_service.list_users(limit=1000)
    stats = {
        "total_users": len(all_users),
        "pending_users": sum(1 for u in all_users if u.status == "pending"),
        "active_users": sum(1 for u in all_users if u.status == "active"),
        # ... more stats
    }
    
    await notification_service.send_daily_report(stats)
```

### Comandi Bot Interattivi

Puoi estendere il bot per rispondere a comandi:

```python
# Future feature
@bot.command("/pending")
async def show_pending(ctx):
    """Show pending users list"""
    pending = await user_service.list_pending_users()
    # Format and send response
```

### Integrazione con Alert System

Collegati al sistema di monitoring per alert automatici:

```python
# On error
notification_service.notify_system_alert(
    alert_type="API Error",
    message=f"Endpoint /api/funds failing",
    details={"error_rate": "15%", "affected_users": 23}
)
```

## Supporto

Per problemi con il bot:
1. Controlla i log dell'applicazione
2. Verifica la configurazione
3. Testa manualmente con curl/script
4. Consulta la [documentazione ufficiale Telegram Bot API](https://core.telegram.org/bots/api)
