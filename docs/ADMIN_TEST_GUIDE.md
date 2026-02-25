# Come Testare la Funzionalità Admin

## Prerequisiti
- Backend in esecuzione
- Frontend in esecuzione
- Email admin configurata: `danielemoltisanti@gmail.com`

## Test Step-by-Step

### 1. Verifica Configurazione Backend

Controlla che la configurazione sia corretta:

```bash
# Nel file app/backend/config.development.json
"admin_emails": ["danielemoltisanti@gmail.com"]

# O nella variabile d'ambiente
APP_AUTH_ADMIN_EMAILS=danielemoltisanti@gmail.com
```

### 2. Login come Admin

1. Apri il frontend: `http://localhost:3000` (o porta configurata)
2. Clicca su "Accedi"
3. Effettua il login con l'account Google: `danielemoltisanti@gmail.com`
4. Dopo il login, dovresti vedere:
   - Un badge "👑 Admin" nell'header (desktop)
   - Nel console del browser: un log con `isAdmin: true`
   - Una nuova voce "👑 Admin" nel menu di navigazione

### 3. Accesso al Pannello Admin

1. Clicca sulla voce "👑 Admin" nella sidebar
2. Dovresti vedere il Pannello Amministrazione con:
   - Header "Pannello Admin"
   - Due tab: "In attesa di approvazione" e "Tutti gli utenti"
   - Elenco degli utenti (se presenti)

### 4. Verifica Restrizioni

**Test con utente non-admin:**
1. Logout
2. Login con un altro account (non admin)
3. La voce "👑 Admin" NON dovrebbe apparire nel menu
4. Se provi ad accedere manualmente alla sezione admin (modificando l'URL), vieni reindirizzato alla home

## Debug

### Console del Browser

Dopo il login, controlla il console del browser per vedere:

```javascript
👤 User info: {
  email: "danielemoltisanti@gmail.com",
  plan: "full-access",
  roles: ["admin"],
  isAdmin: true
}
```

### Verificare Risposta API

Puoi controllare la risposta dell'API `/auth/me`:

```bash
# Con curl (sostituisci il token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/auth/me

# Oppure nel browser Network tab -> XHR -> /auth/me
```

La risposta dovrebbe includere:
```json
{
  "id": "...",
  "email": "danielemoltisanti@gmail.com",
  "name": "Daniele Moltisanti",
  "plan": "full-access",
  "roles": ["admin"],
  "status": "active"
}
```

## Possibili Problemi

### Admin non viene riconosciuto

**Problema**: Login effettuato ma `isAdmin` è `false` o `undefined`

**Soluzioni**:
1. Verifica che l'email nel database corrisponda esattamente a quella configurata
2. Controlla il console del backend per eventuali errori
3. Prova a cancellare l'utente dal database e ri-fare il login
4. Verifica che il backend stia leggendo correttamente la configurazione:
   ```python
   from config.auth import get_auth_config
   config = get_auth_config()
   print(config.admin_emails)
   print(config.is_admin_email("danielemoltisanti@gmail.com"))
   ```

### Sezione Admin non appare

**Problema**: Badge admin visibile ma voce menu mancante

**Soluzioni**:
1. Controlla che `user.isAdmin` sia `true` nel log
2. Verifica che il componente `App.tsx` includa la logica per mostrare la voce admin:
   ```typescript
   ...(user?.isAdmin ? [{ id: 'admin' as DashboardSection, label: '👑 Admin' }] : [])
   ```
3. Ricarica la pagina (F5) per assicurarti che lo stato sia aggiornato

### Errori API Admin

**Problema**: Errore 403 quando si accede alle API admin

**Soluzioni**:
1. Verifica che il token JWT includa il ruolo admin nei claims
2. Controlla i log del backend per vedere cosa sta bloccando la richiesta
3. Assicurati che le route admin richiedano `require_roles("admin")`

## API Admin Disponibili

Dopo il login come admin, puoi usare queste API:

```bash
# Lista utenti in attesa
GET /admin/users/pending

# Lista tutti gli utenti
GET /admin/users

# Approva utente
POST /admin/users/approve
Body: {"user_id": "USER_ID"}

# Rifiuta utente
POST /admin/users/reject
Body: {"user_id": "USER_ID"}

# Sospendi utente
POST /admin/users/suspend
Body: {"user_id": "USER_ID", "reason": "Motivo sospensione"}

# Riattiva utente
POST /admin/users/{user_id}/reactivate

# Elimina utente
DELETE /admin/users/{user_id}
```

Tutte richiedono autenticazione con ruolo admin.
