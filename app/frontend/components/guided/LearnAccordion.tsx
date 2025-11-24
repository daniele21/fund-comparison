import React from 'react';

export const LearnAccordion: React.FC = () => (
  <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
    {/* CAPIRE COSA STAI GUARDANDO */}
    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Capire cosa stai guardando</h2>
    <div className="space-y-3 mb-8">
      <AccordionItem title="Cos'è l'ISC e perché è importante?" defaultOpen>
        L'ISC (Indicatore Sintetico dei Costi) è una misura percentuale che sintetizza il costo annuo del fondo pensione 
        sul capitale investito. Viene calcolato dalla COVIP con una metodologia standardizzata per permettere confronti 
        oggettivi tra diversi fondi.
        <br /><br />
        L'ISC viene espresso per diverse durate di permanenza (2, 5, 10 e 35 anni) perché l'incidenza dei costi diminuisce 
        con l'aumentare del periodo di adesione. Minore è l'ISC, maggiore sarà il capitale che accumulerai nel tempo, 
        poiché meno risorse vengono assorbite dai costi di gestione. Anche una differenza di pochi decimali percentuali 
        può tradursi in migliaia di euro in più o in meno alla pensione dopo 30-40 anni di contribuzione.
      </AccordionItem>

      <AccordionItem title="Quali sono le linee di investimento?">
        I fondi pensione offrono diverse linee di investimento (o comparti) che si differenziano per il livello di rischio 
        e il potenziale rendimento. Le principali categorie sono:
        <br /><br />
        <strong>Linea garantita:</strong> offre la garanzia del capitale o del rendimento minimo, ideale per chi è vicino 
        alla pensione o molto avverso al rischio.
        <br /><br />
        <strong>Linea obbligazionaria:</strong> investe prevalentemente in titoli di debito, con rischio contenuto e 
        rendimenti moderati, adatta a chi ha un orizzonte temporale medio-breve (5-10 anni).
        <br /><br />
        <strong>Linea bilanciata:</strong> combina investimenti azionari e obbligazionari, con un profilo di 
        rischio/rendimento intermedio, indicata per chi ha almeno 10-15 anni prima della pensione.
        <br /><br />
        <strong>Linea azionaria:</strong> investe principalmente in azioni, con rischio più elevato ma maggior potenziale 
        di crescita nel lungo periodo, consigliata per chi ha oltre 15-20 anni all'orizzonte pensionistico.
      </AccordionItem>

      <AccordionItem title="Quali sono le differenze tra FPN, FPA e PIP?">
        <strong>Fondi Pensione Negoziali (FPN):</strong> istituiti attraverso contratti collettivi, riservati ai lavoratori 
        dipendenti di specifici settori (es: Cometa per metalmeccanici). Caratteristiche: contributo datore obbligatorio, 
        costi bassi, governance partecipativa, TFR obbligatorio.
        <br /><br />
        <strong>Fondi Pensione Aperti (FPA):</strong> istituiti da banche, assicurazioni, SGR o SIM, accessibili a chiunque. 
        Caratteristiche: massima libertà di scelta, nessun contributo datoriale automatico (possibile solo se previsto dal 
        contratto), costi mediamente più alti, ideali per autonomi e professionisti.
        <br /><br />
        <strong>PIP (Piani Individuali Pensionistici):</strong> prodotti assicurativi vita con finalità previdenziale, 
        accessibili a tutti. Caratteristiche: natura assicurativa, garanzie aggiuntive opzionali, costi tendenzialmente 
        più elevati, massima flessibilità, gestione separata.
      </AccordionItem>

      <AccordionItem title="Come funziona questo comparatore e quali dati utilizza?">
        Il comparatore utilizza i dati ufficiali forniti dalla COVIP (Commissione di Vigilanza sui Fondi Pensione), 
        l'autorità pubblica che vigila sul settore della previdenza complementare in Italia. I dati vengono aggiornati 
        periodicamente e comprendono informazioni su costi, rendimenti storici, composizione del patrimonio e caratteristiche 
        di ciascun fondo.
        <br /><br />
        Puoi filtrare e confrontare i fondi pensione in base a diversi criteri: tipologia (fondi negoziali, aperti, PIP), 
        ISC (Indicatore Sintetico dei Costi), rendimenti a 10 anni, linee di investimento disponibili e altre caratteristiche 
        rilevanti. Il comparatore ti aiuta a prendere una decisione informata e trasparente.
      </AccordionItem>
    </div>

    {/* CAPIRE IL MONDO DEI FONDI PENSIONE */}
    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Capire il mondo dei fondi pensione</h2>
    <div className="space-y-3">
      <AccordionItem title="Che cos'è un fondo pensione e perché dovrei aderire?">
        Un fondo pensione è uno strumento di previdenza complementare che ti permette di costruire, durante la vita lavorativa, 
        una pensione aggiuntiva a quella pubblica obbligatoria. L'adesione è volontaria ma fortemente consigliata, considerando 
        che la pensione pubblica futura potrebbe non essere sufficiente a mantenere il tenore di vita desiderato.
        <br /><br />
        I vantaggi principali includono: deducibilità fiscale dei contributi versati fino a 5.164,57€ all'anno e la possibilità 
        di destinare il TFR maturando al fondo. Inoltre, puoi richiedere anticipazioni per spese sanitarie, acquisto prima casa 
        o altre esigenze previste dalla normativa.
      </AccordionItem>

      <AccordionItem title="Posso cambiare fondo pensione?">
        Sì, puoi trasferire la tua posizione da un fondo all'altro liberamente. Dopo i primi 2 anni di adesione, il trasferimento 
        è sempre gratuito e senza penali. Prima dei 2 anni è possibile ma potrebbero applicarsi oneri, da verificare nel 
        regolamento del fondo di origine.
        <br /><br />
        Il trasferimento comporta il passaggio dell'intero montante accumulato (contributi versati più rendimenti maturati) al 
        nuovo fondo prescelto, mantenendo l'anzianità contributiva ai fini del diritto alle prestazioni. È un'operazione semplice: 
        basta compilare il modulo di adesione al nuovo fondo indicando di voler trasferire la posizione esistente, e sarà il nuovo 
        fondo a gestire tutte le pratiche con quello precedente.
        <br /><br />
        Prima di trasferire, confronta attentamente costi, rendimenti storici e servizi offerti per assicurarti che il cambio 
        sia vantaggioso.
      </AccordionItem>

      <AccordionItem title="Quando è opportuno aderire a un fondo pensione?">
        La risposta è semplice: il prima possibile. Prima si inizia, maggiori saranno i benefici accumulati grazie alla 
        capitalizzazione composta e ai vantaggi fiscali immediati. È consigliato aprire un fondo pensione anche per i propri 
        figli il prima possibile, anche senza versamenti, per sfruttare l'anzianità del fondo.
      </AccordionItem>

      <AccordionItem title="Come viene tassata la prestazione finale?">
        La tassazione della prestazione finale del fondo pensione non è uniforme su tutte le componenti del montante accumulato.
        <br /><br />
        <strong>Aliquota base e riduzione per anzianità:</strong> L'aliquota ordinaria è del 15%, ma si riduce dello 0,30% 
        per ogni anno oltre il 15°, fino a un minimo del 9%.
        <br /><br />
        <strong>Contributi dedotti fiscalmente:</strong> I contributi versati entro 5.164,57€/anno che hai dedotto sono tassati 
        al 15% (riducibile al 9%).
        <br /><br />
        <strong>Contributi NON dedotti:</strong> I contributi oltre il limite, se non dedotti, sono completamente esenti da 
        tassazione. È necessario comunicare al fondo l'importo entro il 31 dicembre dell'anno successivo.
        <br /><br />
        <strong>TFR:</strong> Il TFR versato al fondo è tassato al 15% (riducibile al 9%).
        <br /><br />
        <strong>Rendimenti maturati:</strong> Tassati al 15% (riducibile al 9%) al momento della prestazione finale. Durante 
        l'accumulo sono già soggetti a tassazione sostitutiva del 20% (o 12,5% per titoli di Stato), poi compensata con la 
        tassazione finale.
      </AccordionItem>
    </div>
  </section>
);

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title,
  children,
  defaultOpen = false,
}) => (
  <details
    className="group rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80"
    open={defaultOpen}
  >
    <summary className="cursor-pointer text-lg font-medium text-slate-800 dark:text-slate-100">
      {title}
    </summary>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{children}</p>
  </details>
);
