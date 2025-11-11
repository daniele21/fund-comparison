import React from 'react';
import { useGuidedComparator } from './GuidedComparatorContext';

export const EntryModeSelector: React.FC = () => {
  const { entryMode, setEntryMode } = useGuidedComparator();

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 dark:bg-slate-900/70 dark:shadow-slate-900/30 dark:ring-slate-800">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Come posso aiutarti oggi?</h1>
      <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
        Scegli il punto di partenza: ti guiderò passo passo, senza venderti nessun prodotto.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <EntryCard
          title="Ho già un fondo pensione"
          description="Scopri in pochi secondi se stai pagando troppo e se il tuo fondo è coerente con i tuoi obiettivi."
          active={entryMode === 'check-fund'}
          onClick={() => setEntryMode(entryMode === 'check-fund' ? null : 'check-fund')}
        />
        <EntryCard
          title="Devo scegliere un fondo"
          description="Partiamo dal tuo profilo per arrivare a una shortlist di fondi adatti al tuo orizzonte."
          active={entryMode === 'choose-fund'}
          onClick={() => setEntryMode(entryMode === 'choose-fund' ? null : 'choose-fund')}
        />
        <EntryCard
          title="Voglio capire come funzionano"
          description="Una guida rapida a costi, rendimenti e rischio, mentre guardi i numeri reali."
          active={entryMode === 'learn'}
          onClick={() => setEntryMode(entryMode === 'learn' ? null : 'learn')}
        />
      </div>
    </section>
  );
};

type EntryCardProps = {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
};

const EntryCard: React.FC<EntryCardProps> = ({ title, description, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-full rounded-2xl border px-5 py-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring dark:border-slate-800 ${
      active
        ? 'border-sky-500 bg-sky-50/70 shadow-lg shadow-sky-200/60 ring-2 ring-sky-200 dark:bg-slate-800 dark:ring-sky-500/40'
        : 'border-slate-200 bg-white shadow shadow-slate-200/50 dark:bg-slate-900'
    }`}
  >
    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{description}</p>
  </button>
);
