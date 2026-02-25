# 🚨 PROBLEMA: Non mi vedo come Admin

## Dove sono definiti gli admin?

Gli admin sono configurati in **2 posti**:

### 1. File di configurazione Development
**File:** `app/backend/config.development.json`

```json
"admin_emails": [
  "danielemoltisanti@gmail.com"
]
```

### 2. File di configurazione Production  
**File:** `app/backend/env_prod.json`

```json
"APP_AUTH_ADMIN_EMAILS": "danielemoltisanti@gmail.com"
```

✅ **La tua email `danielemoltisanti@gmail.com` è CONFIGURATA correttamente in entrambi!**

---

## Perché non mi vedo come admin?

Ci sono **3 possibili cause**:

### 🔴 Causa 1: Hai fatto login PRIMA di configurare gli admin

**Problema:** L'utente è già nel database con ruoli vecchi (es. `["free"]` o `["subscriber"]`)

**Soluzione:**

1. **Opzione A - Rimuovi l'utente dal database:**
   ```bash
   # Vai su Firebase Console
   # Firestore Database -> users collection
   # Cerca il documento con la tua email
   # Elimina il documento
   # Poi ri-fai il login
   ```

2. **Opzione B - Usa lo script di correzione:**
   ```bash
   cd /Users/moltisantid/Personal/fund-comparison
   python scripts/check_admin_user.py
   ```

### 🔴 Causa 2: Il backend non sta usando la configurazione corretta

**Problema:** Il backend usa un file `.env` che sovrascrive la configurazione

**Verifica:**
```bash
cd /Users/moltisantid/Personal/fund-comparison/app/backend

# Controlla se esiste un file .env
ls -la .env*

# Se esiste, verifica il contenuto
cat .env
```

**Soluzione:** 
Aggiungi questa riga al file `.env`:
```bash
APP_AUTH_ADMIN_EMAILS=danielemoltisanti@gmail.com
```

### 🔴 Causa 3: Il frontend non riceve correttamente i ruoli

**Verifica nel browser:**

1. Apri il **Console del browser** (F12)
2. Fai login
3. Cerca il log che mostra:
   ```javascript
   👤 User info: {
     email: "danielemoltisanti@gmail.com",
     plan: "...",
     roles: [...],
     isAdmin: ...
   }
   ```

**Se vedi `roles: ["free"]` o `roles: ["subscriber"]`:**
- Il problema è nel database (vedi Causa 1)

**Se vedi `roles: ["admin"]` ma `isAdmin: false`:**
- C'è un bug nel frontend (dovrebbe calcolare `isAdmin` dai ruoli)

---

## ✅ SOLUZIONE RAPIDA (Consigliata)

### Step 1: Verifica la configurazione
```bash
cd /Users/moltisantid/Personal/fund-comparison
python scripts/show_admin_config.py
```

Dovresti vedere:
```
✅ danielemoltisanti@gmail.com -> ADMIN
```

### Step 2: Fai logout e re-login

1. Nel frontend, clicca su "Esci"
2. Clicca su "Accedi" 
3. Fai login con `danielemoltisanti@gmail.com`

### Step 3: Verifica nel Console del browser

Dovresti vedere:
```javascript
👤 User info: {
  email: "danielemoltisanti@gmail.com",
  plan: "full-access",
  roles: ["admin"],
  isAdmin: true  // ← Questo deve essere true!
}
```

### Step 4: Controlla l'header

Dovresti vedere:
- Badge "👑 Admin" nell'header (desktop)
- Voce "👑 Admin" nel menu laterale

---

## 🔧 Se ancora non funziona

### Debug nel backend

1. Vai nel backend e aggiungi un log temporaneo:

**File:** `app/backend/services/user_service.py`

Trova la funzione `upsert_user` e aggiungi:
```python
print(f"🔍 DEBUG - Email: {user_email}")
print(f"🔍 DEBUG - is_admin: {is_admin}")
print(f"🔍 DEBUG - admin_emails: {auth_config.admin_emails}")
```

2. Riavvia il backend
3. Fai logout e re-login
4. Controlla i log del backend

### Verifica Firestore

Se usi Firebase:

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Seleziona il progetto `financial-suite`
3. Firestore Database
4. Collection: `users`
5. Cerca il documento con la tua email
6. Verifica i campi:
   - `roles`: deve essere `["admin"]`
   - `status`: deve essere `"active"`
   - `plan`: deve essere `"full-access"`

Se i valori sono diversi, puoi:
- Eliminare il documento e ri-fare il login
- Oppure modificarli manualmente

---

## 📞 Ancora problemi?

Inviami:
1. Screenshot del console del browser dopo il login
2. Screenshot del menu laterale
3. Output del comando: `python scripts/show_admin_config.py`
4. Log del backend durante il login
