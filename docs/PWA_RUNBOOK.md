# PWA Runbook

## Scope e motivazione

Questa baseline rende il frontend una PWA reale e verificabile:

- installabile (manifest valido + icone dedicate);
- aggiornabile (service worker versionato);
- resiliente offline (fallback documentato e testabile).

Obiettivo operativo: garantire UX minima anche con rete intermittente e ridurre regressioni in deploy.

## Impatti su frontend/backend/config

Frontend:

- aggiunto `app/frontend/public/manifest.webmanifest`;
- aggiunto `app/frontend/public/sw.js`;
- aggiunto `app/frontend/public/offline.html`;
- aggiunta registrazione service worker in `app/frontend/utils/pwa.ts`, usata da `app/frontend/index.tsx`;
- aggiunto banner update utente in `app/frontend/components/common/PwaUpdateBanner.tsx`;
- aggiornato `app/frontend/index.html` per `manifest`, meta PWA e application name.

Backend:

- nessun impatto su API, auth o contratti dati.

Config/infrastruttura:

- aggiornato `firebase.json` con header no-cache per `sw.js`, `manifest.webmanifest`, `offline.html`.

## Strategia offline

- `install`: precache shell (`/`, `/index.html`, manifest, offline page, icone principali).
- `activate`: cleanup delle cache vecchie in base a `CACHE_VERSION`.
- `navigation requests`: network-first; fallback a cache shell e poi `offline.html`.
- `asset statici`: stale-while-revalidate per `script`, `style`, `font`, `image`.
- `API GET`: network-first con fallback cache solo su allowlist sicura (`/auth/config`, `/api/public/*`).

## Strategia aggiornamenti

- quando il browser scarica un nuovo service worker, l'app mostra un banner "nuova versione disponibile";
- l'update viene applicato solo su azione esplicita utente (`Aggiorna ora`);
- dopo `SKIP_WAITING`, il client fa reload controllato su `controllerchange`.

## Versioning e aggiornamenti

- Versione cache centralizzata in `app/frontend/public/sw.js` (`CACHE_VERSION`).
- Processo consigliato quando cambia shell/caching:
  1. aggiornare `CACHE_VERSION`;
  2. eseguire build;
  3. deploy hosting;
  4. verificare update SW con hard refresh + reopen app.

## Piano test e risultati attesi

Check installabilita:

1. Apri app in Chrome (desktop o Android) su HTTPS.
2. Verifica presenza prompt installazione o pulsante "Installa app".
3. Dopo install, apri app standalone e verifica caricamento home.

Check update service worker:

1. Deploy con `CACHE_VERSION` incrementata.
2. Apri app esistente e verifica comparsa banner update.
3. Clicca `Aggiorna ora` e verifica reload controllato dopo update controller.
4. In DevTools > Application > Service Workers controlla che sia attiva la nuova versione.

Check offline:

1. Carica app online almeno una volta.
2. Metti rete `Offline` in DevTools.
3. Naviga su route già usate (`/`, `/compare`, `/simulator`).
4. Risultato atteso:
   - shell visibile da cache dove disponibile;
   - fallback `offline.html` in caso di miss completo.

## Evidenza verifiche eseguite (2026-02-27)

- `cd app/frontend && pnpm build`: `OK`
- `cd app/frontend && pnpm exec tsc --noEmit`: `KO` per errori TypeScript preesistenti nei componenti animazione/recharts (non introdotti da questa modifica PWA).
- `cd app/frontend && pnpm lint`: `KO` script non presente (`Command "lint" not found`).

## Rischi aperti e rollback

Rischi aperti:

- cache stale se `CACHE_VERSION` non viene incrementata su cambi strutturali;
- dati API live non garantiti offline (scope limitato alla shell).

Rollback:

1. ripristinare versione precedente di `sw.js`/manifest;
2. redeploy Firebase Hosting;
3. opzionale: invalidare cache lato client con cambio versione SW.
