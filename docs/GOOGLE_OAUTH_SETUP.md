# Google OAuth Setup - Fix redirect_uri_mismatch

## Problema

L'errore `Error 400: redirect_uri_mismatch` si verifica quando Google OAuth non riconosce l'origine della richiesta.

## Soluzione

### 1. Accedi a Google Cloud Console

Vai a: https://console.cloud.google.com/apis/credentials

### 2. Seleziona il tuo OAuth 2.0 Client ID

Cerca e clicca sul Client ID che inizia con: `your-google-oauth-client-id`

### 3. Configura le Origini JavaScript Autorizzate

**IMPORTANTE**: Con Google Identity Services (GIS), devi aggiungere le origini del frontend, NON i redirect URI del backend!

Nella sezione **"Origini JavaScript autorizzate"**, aggiungi:

```
http://localhost:3000
http://127.0.0.1:3000
```

Per produzione, aggiungi anche:
```
https://financial-suite.web.app
https://tu-dominio-produzione.com
```

### 4. URI di Reindirizzamento (Opzionale)

Nella sezione **"URI di reindirizzamento autorizzati"**, se vuoi mantenere anche il flusso redirect tradizionale (oltre al popup GIS), aggiungi:

```
http://127.0.0.1:8001/auth/google/callback
http://localhost:8001/auth/google/callback
```

Per produzione:
```
https://fund-comparison-api-485218071894.europe-west1.run.app/auth/google/callback
```

### 5. Salva le Modifiche

Clicca su **"Salva"** in fondo alla pagina.

⏱️ **Nota**: Le modifiche potrebbero richiedere 1-2 minuti per propagarsi.

## Verifica

1. **Ricarica il frontend** (http://localhost:3000)
2. **Clicca su "Accedi con Google"**
3. **Dovrebbe aprirsi il popup di Google** senza errori
4. **Dopo l'autorizzazione**, dovresti essere autenticato

## Architettura del Flusso

### Frontend (`http://localhost:3000`)
1. Carica Google Identity Services (GIS) library
2. Chiama `/auth/google/config` per ottenere client_id
3. Inizializza `google.accounts.oauth2.initCodeClient()`
4. Apre popup GIS nativo di Google
5. Riceve authorization code dal popup
6. Chiama `/auth/google/exchange` con il code

### Backend (`http://127.0.0.1:8001`)
1. Endpoint `/auth/google/config` ritorna la configurazione OAuth
2. Endpoint `/auth/google/exchange` riceve il code:
   - Verifica CSRF (X-Requested-With header)
   - Verifica origin (deve essere in allowed_origins)
   - Scambia il code con Google per ottenere tokens
   - Verifica ID token
   - Crea/aggiorna utente in Firestore (status: pending)
   - Invia notifica Telegram all'admin
   - Crea sessione JWT
   - Ritorna token al frontend

### Google OAuth
- **Origini JavaScript autorizzate**: `http://localhost:3000`
- **Flusso**: Authorization Code con PKCE (implicit via GIS popup)
- **Scopes**: `openid email profile`

## Troubleshooting

### Errore: "Google Identity Services library failed to load"

Verifica che lo script GIS sia caricato in `index.html`:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Errore: "Origin not allowed"

Verifica che nel backend `.env` o `launch.json` sia configurato:
```env
APP_FRONTEND_BASE_URL=http://localhost:3000
```

### Errore: "Failed to exchange authorization code"

Controlla i log del backend per dettagli. Potrebbe essere un problema con:
- Client secret errato
- Code già utilizzato (scade dopo pochi secondi)
- Origin mismatch nel backend

### Il popup si apre ma non succede nulla

Verifica nella console del browser se ci sono errori JavaScript. Assicurati che il frontend stia chiamando correttamente `/auth/google/exchange`.

## File Modificati

### Frontend
- `app/frontend/index.html` - Aggiunto script GIS
- `app/frontend/auth.tsx` - Implementato flusso GIS con `initCodeClient()`
- `app/frontend/components/LoginModal.tsx` - Aggiornato testo pulsante e icona Google

### Backend (già configurato)
- `app/backend/routes/google_auth.py` - Endpoints per GIS popup flow
- `app/backend/config/google_oauth.py` - Configurazione OAuth
- `app/backend/services/google_oauth_service.py` - Logica di scambio token

## Configurazione Attuale

### Launch Configuration (VS Code)
```json
{
  "name": "Backend: FastAPI (Google OAuth)",
  "env": {
    "APP_AUTH_MODE": "google",
    "APP_GOOGLE_CLIENT_ID": "your-google-oauth-client-id.apps.googleusercontent.com",
    "APP_GOOGLE_CLIENT_SECRET": "your-google-oauth-client-secret",
    "APP_FRONTEND_BASE_URL": "http://localhost:3000"
  }
}
```

### Frontend .env
```env
VITE_API_BASE=http://127.0.0.1:8001
```

## Riferimenti

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Authorization Code Flow](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Identity: Popup UX Mode](https://developers.google.com/identity/gsi/web/guides/overview)
