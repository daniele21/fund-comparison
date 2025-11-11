import React from 'react';

export const LearnAccordion: React.FC = () => (
  <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Capire cosa stai guardando</h2>
    <div className="mt-4 space-y-3">
      <AccordionItem
        title="Cosa sono i fondi pensione complementari?"
        defaultOpen
      >
        Sono strumenti che ti permettono di accumulare una pensione aggiuntiva rispetto a quella pubblica,
        con vantaggi fiscali e un capitale investito sui mercati finanziari secondo un regolamento preciso.
      </AccordionItem>
      <AccordionItem title="Cosa significa ISC?">
        È l’Indicatore Sintetico dei Costi. Riassume tutti i costi in una percentuale annua “media”
        proiettata su 2, 5, 10 o 35 anni. Più è basso, più soldi restano investiti per te.
      </AccordionItem>
      <AccordionItem title="Perché guardare i rendimenti a 10 anni?">
        I risultati di 1–3 anni possono dipendere molto dal momento di ingresso. Uno storico più lungo aiuta
        a capire come il fondo ha attraversato fasi diverse del mercato.
      </AccordionItem>
      <AccordionItem title="Cosa significa “coerenza con l’orizzonte”?">
        Un fondo molto azionario può avere oscillazioni forti: su 25–30 anni questo può essere accettabile,
        a pochi anni dalla pensione può risultare troppo rischioso. L’idea è far dialogare tipologia di
        fondo e anni che mancano al riscatto.
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
