# Tour Guidato Contestuale - Update Operativo

## Scope e motivazione
Questo aggiornamento sostituisce il tour placeholder statico con un tour contestuale basato su `react-joyride`.
Obiettivo: guidare l'utente componente per componente con spotlight reale, auto-scroll e tooltip ancorato al target.

## Impatti frontend/backend/config
- Frontend:
  - Refactor `app/frontend/components/common/GuidedTour.tsx`.
  - Aggiunta target mancante `data-tour="simulator-inputs"` in `app/frontend/components/simulator/StepMontante.tsx`.
  - Dipendenza nuova: `react-joyride` in `app/frontend/package.json` + lockfile.
- Backend: nessun impatto.
- Config/env: nessuna variabile nuova.

## UX e comportamento
- Flusso bloccato durante il tour (`spotlightClicks: false`, overlay non chiudibile via click esterno).
- Auto-scroll attivo sul target step con `scrollToFirstStep` e `scrollOffset` mobile-friendly.
- Fallback robusto: se un target non esiste, il tour non si interrompe (fallback su `body` o skip step tramite callback).
- Persistenza invariata su `localStorage`:
  - `tour_completed_<key>`
  - `tour_dismissed_<key>`

## PWA/mobile/offline
- Nessun cambio a manifest/service worker/offline strategy.
- Compatibilità mobile migliorata lato onboarding grazie a spotlight e scroll contestuale.

## Piano test e risultati
Comandi eseguiti:
- `cd app/frontend && pnpm exec tsc --noEmit`
- `cd app/frontend && pnpm build`

QA manuale da eseguire post-deploy:
1. Avvio tour da banner e da bottone "Tour Guidato" in `simulator`, `choose-fund`, `have-fund`.
2. Verifica highlight corretto su ogni target `data-tour`.
3. Verifica skip/completion e salvataggio stato in `localStorage`.
4. Verifica mobile viewport: tooltip leggibile, niente clipping.

## Rischi aperti e rollback
Rischi:
- `react-joyride@2.9.3` dichiara peer React fino a 18; il progetto usa React 19. Serve monitoraggio runtime su tooltip/overlay.

Rollback:
1. Ripristinare `GuidedTour.tsx` precedente.
2. Rimuovere `data-tour="simulator-inputs"` se necessario.
3. Rimuovere dipendenza `react-joyride` e aggiornare lockfile.
