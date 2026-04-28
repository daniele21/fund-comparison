# Rating Fondi Pensione

## Scope
Il rating viene calcolato per ogni comparto disponibile nel dataset frontend, includendo FPN, FPA e PIP. La UI confronta gia questi prodotti allo stesso livello, quindi il rating e applicato in modo uniforme al comparto, non al fondo aggregato.

## Formula
La metodologia deriva da `docs/calcolo-rating.md`.

- Il comparto e ammissibile se ha rendimento a 3 anni e almeno un ISC tra 10 anni e 5 anni.
- L'ISC usato e `isc10a` se disponibile, altrimenti `isc5a`.
- Per ogni periodo disponibile si calcola `score = rendimento - ISC usato`.
- I pesi base sono: 3 anni `15%`, 5 anni `20%`, 10 anni `25%`, 15 anni `15%`, 20 anni `15%`, 25 anni `10%`.
- I pesi sono normalizzati solo sui periodi disponibili.
- Il rating score e arrotondato a 2 decimali.

Classi:

| Score | Classe | Descrizione |
| --- | --- | --- |
| >= 8,00 | A | Eccellente |
| 5,00 - 7,99 | B | Buono |
| 2,00 - 4,99 | C | Medio |
| 0,00 - 1,99 | D | Debole |
| < 0,00 | E | Scarso |

## Limiti Dati Attuali
Il dataset corrente espone rendimenti a 1, 3, 5, 10 e 20 anni e ISC a 2, 5, 10 e 35 anni. Non sono disponibili data di nascita comparto, rendimento a 15 anni o rendimento a 25 anni.

Per questa versione si adotta una policy prudente:

- la presenza del rendimento a 3 anni vale come requisito minimo operativo di storia sufficiente;
- i periodi 15 e 25 anni restano `null`;
- il rating viene escluso se manca il rendimento a 3 anni;
- i fondi con rating non calcolabile restano visibili con motivazione.

## UX
Il rating e mostrato:

- accanto al nome fondo nella tabella desktop;
- come badge e metrica nelle card mobile;
- nella modale di dettaglio, con score, classe, ISC usato, tipo adesione e breakdown degli score disponibili.

## Test e Rollback
Verifiche minime:

- `cd app/frontend && pnpm build`
- controllo manuale tabella fondi desktop/mobile;
- controllo modale dettaglio su un fondo calcolabile e uno non calcolabile;
- controllo installabilita PWA dopo aggiornamento di manifest e service worker.

Rollback:

- rimuovere il campo `rating` da `PensionFund`;
- rimuovere `utils/fundRating.ts`;
- rigenerare `app/frontend/data/funds.ts` senza rating;
- ripristinare manifest/service worker/icons precedenti se il rollback riguarda anche il brand.
