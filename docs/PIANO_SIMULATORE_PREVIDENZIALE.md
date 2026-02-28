# 📐 Piano di Implementazione – Simulatore Previdenziale

> **Obiettivo**: permettere all'utente di simulare la rivalutazione del proprio montante accumulato nel fondo pensione scelto, visualizzare il risparmio fiscale IRPEF e calcolare l'imposta sostitutiva alla pensione. Tutto client-side, zero dati salvati.

---

## 1 · Visione d'insieme

La nuova feature si chiama **"Simulatore"** e diventa una **nuova sezione della sidebar**, al pari di "Check", "Decisione", "Capire" e "TFR Info". L'utente vi accede dopo aver selezionato uno o più fondi nella fase di confronto, oppure direttamente dal menu laterale.

Il simulatore è suddiviso in **3 step progressivi** (wizard a tab orizzontali), ciascuno auto-contenuto ma che alimenta il successivo:

| Step | Titolo | Input utente | Output |
|------|--------|--------------|--------|
| **1** | Rivalutazione Montante | Importo iniziale, contributo annuo, fondo/i selezionato/i | Grafico crescita montante nel tempo |
| **2** | Risparmio Fiscale IRPEF | RAL lorda annua | Risparmio annuo + montante netto comprensivo del beneficio |
| **3** | Imposta alla Pensione | Anno prima sottoscrizione FP | Aliquota finale e montante netto post-tassazione |

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar                                                     │
│  ┌───────────┐                                              │
│  │  Guida    │                                              │
│  │  Check    │                                              │
│  │  Decisione│                                              │
│  │  Capire   │                                              │
│  │▶ Simulatore│  ◄── NUOVA VOCE                             │
│  │  TFR Info │                                              │
│  └───────────┘                                              │
│                                                              │
│  ┌─ Main Content ──────────────────────────────────────────┐│
│  │  ┌──────────┬──────────────┬────────────────────┐       ││
│  │  │ 1.Montante│ 2.Fiscalità │ 3.Imposta Pensione │       ││
│  │  └──────────┴──────────────┴────────────────────┘       ││
│  │                                                          ││
│  │  [Form inputs]                                           ││
│  │  [Grafico interattivo]                                   ││
│  │  [Riepilogo numerico]                                    ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 2 · UX / UI Design

### 2.1 Accesso alla sezione

- **Sidebar**: nuova voce `Simulatore` con icona calcolatrice (`CalculatorIcon`), posizionata tra "Capire" e "TFR Info".
- **CTA contestuali**: al termine del confronto fondi (Visual Comparison), un banner invita l'utente → _"Vuoi sapere quanto potrebbe valere il tuo investimento tra 20 anni? Prova il Simulatore →"_.
- Dalla `FundDetailModal`, un bottone secondario _"Simula investimento con questo fondo"_ apre il Simulatore pre-compilando il fondo.

### 2.2 Layout del Simulatore (Wizard a 3 step)

L'interfaccia segue il pattern visuale già usato nelle sezioni esistenti (card con `rounded-2xl`, border, shadow-sm, dark mode) ed espone:

1. **Barra di progresso** (3 step con icone e titolo): l'utente può muoversi liberamente tra gli step cliccando sulla tab.
2. **Area form** (colonna sinistra su desktop / sopra su mobile): input con label chiare, tooltip informativi, valori di default sensati.
3. **Area risultato** (colonna destra su desktop / sotto su mobile): grafico Recharts + card di riepilogo numeriche.

### 2.3 Privacy Banner

In cima al simulatore, un banner persistente, elegante e rassicurante:

```
🔒 I tuoi dati restano sul tuo dispositivo
Tutti i calcoli avvengono interamente nel tuo browser.
Non salviamo, tracciamo né trasmettiamo alcun dato personale che inserisci in questa pagina.
```

- Colore: `bg-emerald-50 border-emerald-200` (light) / `bg-emerald-950/40 border-emerald-800` (dark)
- Icona lucchetto + testo conciso.
- Cliccabile per espandere un dettaglio più lungo (accordion).

---

## 3 · Step 1 – Rivalutazione Montante

### 3.1 Input

| Campo | Tipo | Default | Validazione | Tooltip |
|-------|------|---------|-------------|---------|
| **Montante iniziale (€)** | `number` slider + input | 5.000 | min 0, max 500.000 | "L'importo già accumulato nel fondo o quello che intendi versare come primo conferimento." |
| **Contributo annuo (€)** | `number` slider + input | 2.000 | min 0, max 20.000 | "L'importo che verserai ogni anno. Puoi considerare il tuo contributo + quello del datore di lavoro + TFR." |
| **Orizzonte temporale (anni)** | `number` slider | 20 | min 1, max 45 | "Quanti anni mancano alla tua pensione." |
| **Fondo/i di riferimento** | `select` / chip pre-selezionati | Fondi già selezionati nel comparatore | almeno 1 | "Il rendimento storico del fondo verrà usato come tasso di rivalutazione." |

### 3.2 Logica di calcolo (client-side)

```
tasso = rendimento10Anni del fondo (se null → rendimento5Anni, se null → rendimento3Anni)

Per ogni anno t da 1 a orizzonte:
  montante[t] = (montante[t-1] + contributoAnnuo) × (1 + tasso/100)

montante[0] = montanteIniziale × (1 + tasso/100)
```

> **Nota**: si usa il rendimento annualizzato storico medio come proxy; va specificato nel disclaimer che i rendimenti passati non sono garanzia di quelli futuri.

### 3.3 Output visuale

- **Grafico ad area (AreaChart Recharts)**: asse X = anno, asse Y = montante (€). Una linea/area per ciascun fondo selezionato, con colori coerenti al `colorMapping` esistente. Se più fondi sono selezionati, si confrontano visivamente.
- **Linea tratteggiata benchmark TFR**: mostra la rivalutazione se l'utente avesse tenuto il TFR in azienda (usando i tassi TFR già in `PerformanceChart.tsx`).
- **Card riepilogo**:
  - Totale versato: `montanteIniziale + contributoAnnuo × orizzonte`
  - Montante rivalutato: `montante[orizzonte]`
  - Rendimento totale: `montante[orizzonte] - totaleVersato`
  - Rendimento %: `(montante[orizzonte] / totaleVersato - 1) × 100`

### 3.4 Disclaimer

> ⚠️ _I rendimenti passati non sono indicativi di quelli futuri. Questa simulazione ha scopo puramente illustrativo e non costituisce consulenza finanziaria._

---

## 4 · Step 2 – Risparmio Fiscale IRPEF

### 4.1 Input aggiuntivo

| Campo | Tipo | Default | Validazione | Tooltip |
|-------|------|---------|-------------|---------|
| **RAL (Reddito Annuo Lordo) €** | `number` input | 30.000 | min 0, max 300.000 | "Il tuo reddito annuo lordo prima delle tasse. Serve per calcolare a quale scaglione IRPEF appartieni." |

### 4.2 Logica di calcolo

**Scaglioni IRPEF 2025 (aggiornati)**:

| Scaglione | Aliquota |
|-----------|----------|
| fino a 28.000 € | 23% |
| 28.001 – 50.000 € | 35% |
| oltre 50.000 € | 43% |

**Calcolo risparmio fiscale annuo**:

```
contributoDeducibile = min(contributoVolontarioAnnuo, 5300)

// L'aliquota marginale è quella dello scaglione in cui cade il reddito dell'utente
aliquotaMarginale = aliquotaIRPEF(RAL)

risparmioFiscaleAnnuo = contributoDeducibile × aliquotaMarginale
```

> **Dettaglio scaglione marginale**: se la RAL è 35.000€, l'aliquota marginale è 35%. Il risparmio su 3.000€ di contributo deducibile è 3.000 × 0.35 = 1.050€/anno.

**Montante con reinvestimento del risparmio fiscale** (ipotesi: l'utente reinveste il risparmio):

```
Per ogni anno t:
  contributoEffettivo = contributoAnnuo + risparmioFiscaleAnnuo
  montanteFiscale[t] = (montanteFiscale[t-1] + contributoEffettivo) × (1 + tasso/100)
```

### 4.3 Output visuale

- **Grafico**: due linee sul medesimo AreaChart dello Step 1:
  - 🔵 **Senza beneficio fiscale** (Step 1)
  - 🟢 **Con beneficio fiscale reinvestito** (Step 2)
- **Card riepilogo**:
  - Aliquota marginale IRPEF: `XX%`
  - Risparmio fiscale annuo: `€ X.XXX`
  - Risparmio fiscale totale (sull'orizzonte): `risparmioAnnuo × orizzonte`
  - Montante finale con beneficio fiscale: `€ XXX.XXX`
  - Differenza rispetto al montante senza beneficio: `+€ XX.XXX (+X,X%)`

### 4.4 Note educative (inline, stile `InfoCard`)

- _"Il contributo volontario versato al fondo pensione è deducibile dal reddito imponibile fino a **€ 5.300/anno**. Questo riduce l'IRPEF che paghi."_
- _"Se reinvesti il risparmio fiscale (es. in un PAC o nello stesso fondo), il tuo capitale cresce in modo ancora più significativo."_

---

## 5 · Step 3 – Imposta Sostitutiva alla Pensione

### 5.1 Input aggiuntivo

| Campo | Tipo | Default | Validazione | Tooltip |
|-------|------|---------|-------------|---------|
| **Anno prima adesione a un FP** | `number` (o year picker) | 2020 | min 1993, max anno corrente | "L'anno in cui hai sottoscritto il tuo primo fondo pensione in assoluto. Determina l'aliquota sostitutiva." |

### 5.2 Logica di calcolo

L'imposta sostitutiva sulle prestazioni in forma di capitale/rendita è:

```
anniPartecipazione = annoCorrente + orizzonte - annoPrimaAdesione

// L'aliquota parte dal 15% e diminuisce dello 0,30% per ogni anno
// di partecipazione oltre il 15°, fino a un minimo del 9%.
if (anniPartecipazione <= 15):
  aliquota = 15%
else:
  riduzione = (anniPartecipazione - 15) × 0.30
  aliquota = max(9%, 15% - riduzione)

impostaSostitutiva = montanteFinale × aliquota
montanteNetto = montanteFinale - impostaSostitutiva
```

> **Nota tecnica**: l'imposta si applica sulla parte del montante corrispondente ai contributi dedotti e ai rendimenti, non sull'intero montante. Per semplicità in questa simulazione applichiamo l'aliquota sull'intero montante, specificandolo nel disclaimer.

### 5.3 Output visuale

- **Indicatore visivo dell'aliquota**: gauge semicircolare animato (o barra di progresso) dal 15% (rosso) al 9% (verde), con l'aliquota dell'utente evidenziata.
- **Timeline visiva**: mostra gli anni di partecipazione e il punto in cui l'utente si trova sulla scala 15% → 9%.
- **Card riepilogo finale**:
  - Anni di partecipazione totali: `XX anni`
  - Aliquota sostitutiva: `XX%`
  - Imposta sostitutiva stimata: `€ XX.XXX`
  - **Montante netto alla pensione**: `€ XXX.XXX` (evidenziato, font grande, colore emerald)

### 5.4 Riepilogo complessivo (fondo pagina Step 3)

Una card "Riepilogo completo della simulazione" che aggrega tutto:

```
┌──────────────────────────────────────────────────────┐
│  📊 Riepilogo della tua simulazione                  │
│                                                       │
│  Totale versato di tasca tua      €  60.000          │
│  Rivalutazione dei rendimenti     € +45.230          │
│  Risparmio fiscale totale         € +20.700          │
│  ─────────────────────────────────────────────        │
│  Montante lordo alla pensione     € 125.930          │
│  Imposta sostitutiva (10,5%)      € -13.223          │
│  ─────────────────────────────────────────────        │
│  💰 MONTANTE NETTO ALLA PENSIONE  € 112.707          │
│                                                       │
│  Rendimento netto sul versato:    +87,8%             │
└──────────────────────────────────────────────────────┘
```

---

## 6 · Architettura Tecnica

### 6.1 Nuovi file (rispettando la struttura modulare DRY del progetto)

```
frontend/
├── components/
│   └── simulator/
│       ├── SimulatorPage.tsx            # Container / wizard con i 3 step
│       ├── SimulatorPrivacyBanner.tsx   # Banner privacy riutilizzabile
│       ├── StepMontante.tsx             # Step 1: input + chart rivalutazione
│       ├── StepFiscale.tsx              # Step 2: input RAL + chart con beneficio
│       ├── StepImpostaPensione.tsx      # Step 3: input anno adesione + gauge
│       ├── SimulatorSummary.tsx         # Card riepilogo complessivo
│       ├── MontanteChart.tsx            # AreaChart Recharts dedicato
│       ├── AliquotaGauge.tsx            # Gauge visivo aliquota 15%→9%
│       └── SimulatorDisclaimer.tsx      # Disclaimer riutilizzabile
│
├── utils/
│   ├── simulatorCalc.ts                # Tutte le funzioni di calcolo pure
│   │   ├── computeMontante()
│   │   ├── computeRisparmioFiscale()
│   │   ├── computeAliquotaSostitutiva()
│   │   ├── getRendimentoProxy()        # 10a → 5a → 3a fallback

---

## Addendum 2026-02-28 · TFR automatico, deducibilità e confronto uniforme

### Nuove regole simulatore
- TFR datore calcolato automaticamente da RAL:
  - `TFR_annuo = (RAL / 13.5) * (1 - 0.005)`.
- Contributo annuo totale usato nella proiezione:
  - `contributoTotale = contributoVolontario + TFR_annuo`.
- Deducibilità fiscale:
  - applicata **solo** al contributo volontario;
  - soglia copy aggiornata a `€5.300/anno`.

### Nuove regole UX simulatore
- Input importi in formato italiano con separatore migliaia (`9.500`, `12.000`).
- Input box ampliati per evitare overflow oltre `10.000`.
- Warning contestuale quando il rendimento proxy usa storico `<10 anni` (3/5 anni).
- Nuovo grafico separato: “Importi versati (senza rendimenti)”.

### Nuove regole confronto fondi
- Selezione limitata a `2-3` fondi.
- Selettore orizzonte confronto obbligatorio: `3`, `5`, `10` anni.
- Selezionabili solo fondi con rendimento disponibile sull’orizzonte scelto.
- CTA rapida “Vai al Simulatore” nella sezione Visual Comparison.
│   │   └── SCAGLIONI_IRPEF             # Costante
│   └── simulatorCalc.test.ts           # Unit test per tutte le funzioni
│
├── types.ts                            # Estensione: SimulatorInput, SimulatorResult
```

### 6.2 Modifiche a file esistenti

| File | Modifica |
|------|----------|
| `App.tsx` | Aggiungere `'simulator'` a `DashboardSection`, nuovo `navItem`, sezione nel rendering |
| `types.ts` | Aggiungere tipi `SimulatorInput` e `SimulatorResult` |
| `GuidedComparatorContext.tsx` | Nessuna modifica: il simulatore legge `selectedFundIds` dal context esistente |
| `FundDetailModal.tsx` | Aggiungere CTA "Simula con questo fondo" → `setActiveSection('simulator')` |
| `constants.ts` | Aggiungere `SCAGLIONI_IRPEF` e `MAX_CONTRIBUTO_DEDUCIBILE = 5300` |

### 6.3 Gestione stato

- **Nessun stato globale aggiuntivo**: il simulatore usa `useState` locali per gli input (montante, contributo, RAL, anno adesione).
- **Fondi selezionati**: letti dal `GuidedComparatorContext` (`selectedFundIds`).
- **Nessuna chiamata API**: calcoli al 100% lato client.
- **Nessun localStorage**: i dati non persistono (privacy by design).

### 6.4 Tipi TypeScript

```ts
// In types.ts
export interface SimulatorInput {
  montanteIniziale: number;
  contributoAnnuo: number;
  orizzonteAnni: number;
  ral: number;
  annoPrimaAdesione: number;
  fundIds: string[];
}

export interface MontanteSeriesPoint {
  anno: number;
  montanteSenzaFiscale: number;
  montanteConFiscale: number;
  montanteTFR: number;
}

export interface SimulatorResult {
  series: MontanteSeriesPoint[];
  totaleVersato: number;
  montanteLordo: number;
  rendimentoTotale: number;
  risparmioFiscaleAnnuo: number;
  risparmioFiscaleTotale: number;
  aliquotaMarginaleIRPEF: number;
  anniPartecipazione: number;
  aliquotaSostitutiva: number;
  impostaSostitutiva: number;
  montanteNetto: number;
}
```

---

## 7 · Responsiveness & Accessibilità

| Aspetto | Implementazione |
|---------|----------------|
| **Mobile** | Step-tab diventa scrollabile orizzontalmente; form e chart in stack verticale; slider al posto di input numerici per i valori principali |
| **Tablet** | Layout a 2 colonne (form + chart) affiancati |
| **Desktop** | Layout a 2 colonne con card riepilogo laterale |
| **Dark mode** | Ereditato dai pattern esistenti (`dark:` Tailwind) |
| **Screen reader** | `aria-label` su slider, `role="tablist"` sugli step, `aria-live="polite"` sui risultati |
| **Keyboard** | Tab tra gli step, Enter per confermare, Arrow per slider |

---

## 8 · Contenuto Educativo Integrato

Ogni step include una sezione "Cosa significa?" espandibile (accordion), che spiega in linguaggio semplice:

- **Step 1**: cos'è l'interesse composto, perché il tempo è il miglior alleato, perché anche piccoli versamenti costanti fanno la differenza.
- **Step 2**: come funziona la deducibilità fiscale, cosa sono gli scaglioni IRPEF, perché chi ha un reddito più alto risparmia di più in valore assoluto.
- **Step 3**: cos'è l'imposta sostitutiva, perché conviene aderire il prima possibile (ogni anno in più dopo il 15° riduce l'aliquota), differenza con la tassazione ordinaria (fino al 43% vs max 15%).

---

## 9 · Ordine di Implementazione

### Fase 1 — Fondamenta (stima: 2-3 giorni)
1. Creare `utils/simulatorCalc.ts` con tutte le funzioni di calcolo + unit test
2. Aggiungere tipi in `types.ts`
3. Aggiungere costanti in `constants.ts`

### Fase 2 — Step 1 (stima: 2-3 giorni)
4. Creare `SimulatorPrivacyBanner.tsx`
5. Creare `MontanteChart.tsx` (AreaChart)
6. Creare `StepMontante.tsx` (form + chart)
7. Creare `SimulatorPage.tsx` (wizard container, con solo Step 1 attivo)
8. Integrare in `App.tsx` (nuova sidebar entry + routing)

### Fase 3 — Step 2 (stima: 1-2 giorni)
9. Creare `StepFiscale.tsx`
10. Collegare al grafico esistente (doppia linea)

### Fase 4 — Step 3 (stima: 1-2 giorni)
11. Creare `AliquotaGauge.tsx`
12. Creare `StepImpostaPensione.tsx`
13. Creare `SimulatorSummary.tsx` (riepilogo complessivo)
14. Creare `SimulatorDisclaimer.tsx`

### Fase 5 — Polish & CTA (stima: 1 giorno)
15. Aggiungere CTA contestuali (Visual Comparison banner, FundDetailModal)
16. Animazioni (ScrollReveal, numeri animati nei riepilogo)
17. Test E2E del flusso completo
18. Review copy e contenuti educativi

---

## 10 · Considerazioni Finali

- **Nessun dato esce dal browser**: tutti i calcoli avvengono in `simulatorCalc.ts`, funzioni pure senza side-effect. Nessuna fetch, nessun analytics sugli input dell'utente.
- **Modulare e testabile**: le funzioni di calcolo sono pure e unitariamente testabili; i componenti UI sono piccoli e riutilizzabili.
- **Coerente con il design system**: si riutilizzano `InfoCard`, `AnimatedButton`, `ScrollReveal`, `PageTransition`, palette colori e tipografia esistenti.
- **Aggiornabile**: le costanti IRPEF sono isolate in `constants.ts`, facilmente aggiornabili se cambia la normativa.
- **Professionale e autorevole**: disclaimer chiari, fonti normative citate (D.Lgs. 252/2005), linguaggio accessibile ma preciso. L'utente si fida perché vede trasparenza (privacy banner, spiegazioni, fonti).
