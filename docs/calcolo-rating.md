**Metodologia di calcolo del Rating — Fondi Pensione Aperti**

**1. Premessa**

Ogni **linea di investimento (comparto)** di un Fondo Pensione Aperto riceve un rating indipendente. Il rating **non viene** calcolato a livello di fondo nel suo complesso, ma su ciascun comparto separatamente (es. Azionario, Bilanciato, Obbligazionario, Garantito).

**2. Verifica di Ammissibilità**

Prima di avviare il calcolo, verificare le seguenti condizioni **in ordine**. Al primo criterio non soddisfatto, interrompere e restituire il messaggio indicato.

1. Il comparto esiste da almeno 3 anni à se non soddisfatta à RATING_NON_CALCOLABILE → "Comparto troppo giovane: storia insufficiente (minimo 3 anni)"
2. Il rendimento a 3 anni è disponibile à se non soddisfatta à RATING_NON_CALCOLABILE → "Rendimento a 3 anni non disponibile"
3. ISC a 10 anni oppure ISC a 5 anni è disponibile à se non soddisfatta àRATING_NON_CALCOLABILE → "ISC non disponibile: comparto troppo giovane"

Se tutte le condizioni sono soddisfatte, procedere al calcolo.

**3. Selezione dell'ISC**

L'ISC (Indicatore Sintetico dei Costi) sostituisce il TER per i fondi pensione. Applicare la seguente logica di selezione **in ordine di priorità**:

SE   ISC_10y è disponibile  →  usa ISC_10y

ALTRIMENTI SE ISC_5y è disponibile  →  usa ISC_5y

ALTRIMENTI  →  RATING_NON_CALCOLABILE ("ISC non disponibile")

Registrare quale orizzonte ISC è stato utilizzato (campo isc_orizzonte: "10y" o "5y"), in modo che sia visibile all'utente nella scheda del comparto.

**4. Calcolo degli Score per Periodo**

Per ogni orizzonte temporale in cui il rendimento è disponibile, calcolare lo **score netto**:

Score_n = Rendimento_n (%) − ISC_selezionato (%)

Gli orizzonti da considerare sono: **3, 5, 10, 15, 20, 25 anni**.

**Esempio:**

| **Periodo** | **Rendimento** | **ISC (10y)** | **Score** |
| --- | --- | --- | --- |
| 3 anni | 5,20% | 1,35% | 3,85 |
| 5 anni | 6,10% | 1,35% | 4,75 |
| 10 anni | 7,40% | 1,35% | 6,05 |
| 15 anni | — | — | *(non disponibile)* |

**5. Calcolo del Rating Ponderato**

**5.1 Pesi base per periodo**

| **Periodo** | **Peso base** |
| --- | --- |
| 3 anni | 15% |
| 5 anni | 20% |
| 10 anni | 25% |
| 15 anni | 15% |
| 20 anni | 15% |
| 25 anni | 10% |

**5.2 Normalizzazione dei pesi**

Considerare **solo i periodi per cui lo score è stato calcolato** (rendimento disponibile). Normalizzare i pesi in modo che la loro somma sia sempre 1,00:

Peso_normalizzato_n = Peso_base_n / SOMMA(Pesi_base dei periodi disponibili)

**Esempio** con 3, 5 e 10 anni disponibili:

- Somma pesi base = 0,15 + 0,20 + 0,25 = 0,60
- Peso norm. 3y = 0,15 / 0,60 = **0,250**
- Peso norm. 5y = 0,20 / 0,60 = 0,333
- Peso norm. 10y = 0,25 / 0,60 = **0,417**

**5.3 Formula del rating score**

Rating_Score = SOMMA( Score_n × Peso_normalizzato_n )   per ogni n disponibile

Arrotondare il risultato a **2 decimali**.

**6. Classificazione del Rating**

Applicare la seguente griglia allo Rating_Score finale:

| **Score** | **Classe** | **Descrizione** |
| --- | --- | --- |
| ≥ 8,00 | **A** | Eccellente |
| 5,00 – 7,99 | **B** | Buono |
| 2,00 – 4,99 | **C** | Medio |
| 0,00 – 1,99 | **D** | Debole |
| < 0,00 | **E** | Scarso |

**7. Output del Calcolo**

Il sistema deve restituire i seguenti campi per ogni comparto elaborato:

| **Campo** | **Tipo** | **Descrizione** |
| --- | --- | --- |
| ammissibile | Boolean | true se il rating è stato calcolato |
| motivo_esclusione | String | null | Messaggio di errore se ammissibile = false |
| isc_utilizzato | Decimal | Valore ISC usato nel calcolo |
| isc_orizzonte | String | "10y" oppure "5y" |
| score_3y | Decimal | null | Score netto per il periodo |
| score_5y | Decimal | null | Score netto per il periodo |
| score_10y | Decimal | null | Score netto per il periodo |
| score_15y | Decimal | null | Score netto per il periodo |
| score_20y | Decimal | null | Score netto per il periodo |
| score_25y | Decimal | null | Score netto per il periodo |
| rating_score | Decimal | Punteggio ponderato finale |
| classe_rating | Char | A / B / C / D / E |
| tipo_adesione | String | "individuale" / "collettiva" |

**8. Casi Limite**

| **Caso** | **Comportamento atteso** |
| --- | --- |
| Solo rendimento a 3 anni disponibile | Calcolo ammesso: score basato solo su 3y con peso normalizzato a 1,00 (100%) |
| ISC 10y assente, ISC 5y presente | Usare ISC 5y; annotare isc_orizzonte = "5y" nell'output |
| ISC 5y e 10y entrambi assenti | RATING_NON_CALCOLABILE |
| Rendimento negativo su un periodo | Lo score sarà negativo: è un valore valido, non escludere |
| Score finale negativo | Classe E — Scarso: è un esito valido, non bloccare |
| Comparto con meno di 3 anni | RATING_NON_CALCOLABILE in ogni caso, anche se ISC disponibile |