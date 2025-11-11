import React, { useMemo } from 'react';
import type { PensionFund } from '../../types';
import { useGuidedComparator } from './GuidedComparatorContext';

type SelectedFundInsightsPanelProps = {
  funds: PensionFund[];
};

export const SelectedFundInsightsPanel: React.FC<SelectedFundInsightsPanelProps> = ({ funds }) => {
  const { selectedFundId, profile } = useGuidedComparator();

  const fund = useMemo(() => funds.find(f => f.id === selectedFundId) ?? null, [funds, selectedFundId]);

  if (!fund) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Come leggere i risultati</h3>
        <p className="mt-3">
          Clicca su un fondo nella tabella o selezionalo dai flussi guidati per vedere una spiegazione in
          linguaggio semplice di cosa significano costi, rendimenti e categoria per il tuo profilo.
        </p>
      </section>
    );
  }

  const horizon = profile.horizonYears;
  let horizonText =
    'senza indicazioni sul tuo orizzonte temporale è difficile valutare la coerenza rispetto al rischio.';

  if (typeof horizon === 'number') {
    if (horizon <= 10) {
      horizonText = 'con meno di 10 anni alla pensione si tende a privilegiare comparti più prudenti.';
    } else if (horizon <= 20) {
      horizonText = 'con 10-20 anni puoi bilanciare stabilità e crescita, senza assumere rischi eccessivi.';
    } else {
      horizonText = 'con oltre 20 anni le oscillazioni di breve periodo pesano meno sull’obiettivo finale.';
    }
  }

  const isc35 = fund.isc?.isc35a;
  const rendimento10y = fund.rendimenti.ultimi10Anni;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-900/40">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Come leggere questo fondo</h3>
      <h4 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">{fund.linea}</h4>
      {fund.societa && <p className="text-sm text-slate-500 dark:text-slate-400">{fund.societa}</p>}

      <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          <strong>Che tipo di fondo è?</strong> È classificato come{' '}
          <strong>{fund.categoria}</strong> ({fund.type}), quindi si posiziona in una fascia di rischio{' '}
          <strong>
            {fund.categoria.includes('GAR')
              ? 'più bassa'
              : fund.categoria.includes('AZ')
              ? 'più alta'
              : 'intermedia'}
          </strong>
          .
        </p>

        <p>
          <strong>Cosa significano i costi?</strong>{' '}
          {isc35 != null ? (
            <>
              L’ISC a 35 anni è <strong>{isc35.toFixed(2)}%</strong>. Differenze anche piccole si
              trasformano in migliaia di euro nel lungo periodo.
            </>
          ) : (
            'Non abbiamo un indicatore a 35 anni per questo fondo.'
          )}
        </p>

        <p>
          <strong>Come si è comportato in passato?</strong>{' '}
          {rendimento10y != null ? (
            <>
              Negli ultimi 10 anni ha reso in media <strong>{rendimento10y.toFixed(2)}% annuo</strong> al
              netto dei costi. I rendimenti passati non garantiscono quelli futuri, ma aiutano a capire come
              il fondo ha gestito i mercati.
            </>
          ) : (
            'Non abbiamo uno storico di 10 anni per questo fondo.'
          )}
        </p>

        <p>
          <strong>È coerente con il tuo orizzonte?</strong> In base alle informazioni inserite, {horizonText}
        </p>
      </div>

      <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
        Questo pannello traduce i numeri in un linguaggio semplice e non sostituisce una consulenza
        finanziaria personalizzata.
      </p>
    </section>
  );
};
