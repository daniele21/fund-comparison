# Configurazione Admin

## Modifiche implementate

### Backend

1. **Config Auth (`app/backend/config/auth.py`)**
   - Aggiunto campo `admin_emails: List[str]` per specificare le email degli admin
   - Aggiunto metodo `is_admin_email(email: str)` per verificare se un'email è admin
   - Aggiornato `get_auth_config()` per leggere `APP_AUTH_ADMIN_EMAILS` dalla variabile d'ambiente

2. **User Service (`app/backend/services/user_service.py`)**
   - Importato `get_auth_config`
   - Modificato `upsert_user()` per:
     - Verificare se l'utente è admin tramite email
     - Assegnare automaticamente ruolo `admin`, status `active` e piano `full-access` agli admin
     - Non inviare notifiche per la registrazione degli admin

3. **File di configurazione**
   - `app/backend/config.development.json`: Aggiunto `"admin_emails": ["danielemoltisanti@gmail.com"]`
   - `app/backend/env_prod.json`: Aggiunto `"APP_AUTH_ADMIN_EMAILS": "danielemoltisanti@gmail.com"`

### Frontend

1. **Types (`app/frontend/types.ts`)**
   - Aggiunto campo `isAdmin?: boolean` all'interfaccia `AuthUser`

2. **Auth Provider (`app/frontend/auth.tsx`)**
   - Modificato `fetchMe()` per calcolare `isAdmin` dal campo `roles`
   - Se `roles` include `'admin'`, viene impostato `isAdmin: true`

3. **Admin Panel (`app/frontend/components/AdminPanel.tsx`)**
   - Nuovo componente per la gestione degli utenti
   - Due tab: "In attesa di approvazione" e "Tutti gli utenti"
   - Funzionalità di approvazione/rifiuto utenti
   - Visibile solo agli admin

4. **App principale (`app/frontend/App.tsx`)**
   - Aggiunto `'admin'` al tipo `DashboardSection`
   - Importato `AdminPanel`
   - Aggiunta voce "👑 Admin" al menu di navigazione (visibile solo agli admin)
   - Aggiunto rendering del `AdminPanel` quando `activeSection === 'admin'`

## Utilizzo

### Backend

Gli admin vengono configurati tramite:
- File JSON: `"admin_emails": ["email1@domain.com", "email2@domain.com"]`
- Variabile d'ambiente: `APP_AUTH_ADMIN_EMAILS=email1@domain.com,email2@domain.com`

Gli utenti con email configurate come admin:
- Vengono automaticamente creati con ruolo `admin`
- Hanno status `active` immediatamente
- Hanno piano `full-access`
- Non richiedono approvazione

### Frontend

Quando un utente con ruolo admin effettua il login:
- Il campo `user.isAdmin` viene impostato a `true`
- Appare una nuova voce "👑 Admin" nel menu di navigazione
- Cliccando su "Admin" si accede al pannello di amministrazione
- Nel pannello è possibile:
  - Visualizzare tutti gli utenti in attesa di approvazione
  - Approvare o rifiutare le richieste
  - Visualizzare l'elenco completo degli utenti

## Email Admin configurate

- `danielemoltisanti@gmail.com` (configurato in development e production)

## API Admin utilizzate

- `GET /admin/users/pending` - Lista utenti in attesa
- `GET /admin/users` - Lista tutti gli utenti
- `POST /admin/users/approve` - Approva un utente
- `POST /admin/users/reject` - Rifiuta un utente

Tutte le API richiedono il ruolo `admin` per essere accedute.
