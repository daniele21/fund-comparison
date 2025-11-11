import React from 'react';

type QuestionChip = {
  id: string;
  label: string;
  description: string;
};

const CHIPS: QuestionChip[] = [
  {
    id: 'cheapest-35y',
    label: 'Costi più bassi a 35 anni',
    description: 'Mostra i fondi con ISC più basso sul lungo periodo.',
  },
  {
    id: 'best-10y-returns',
    label: 'Chi ha reso meglio in 10 anni',
    description: 'Ordina per rendimento netto a 10 anni, a parità di categoria.',
  },
  {
    id: 'near-retirement',
    label: 'Sono vicino alla pensione',
    description: 'Mostra fondi più prudenti, con volatilità più bassa.',
  },
  {
    id: 'just-starting',
    label: 'Sto iniziando ora',
    description: 'Focalizzati su costi bassi e storico solido.',
  },
];

type QuestionChipsBarProps = {
  onPresetSelected?: (id: string) => void;
};

export const QuestionChipsBar: React.FC<QuestionChipsBarProps> = ({ onPresetSelected }) => {
  const handleClick = (id: string) => {
    onPresetSelected?.(id);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Cosa vuoi vedere per prima cosa?
        </span>
        <div className="flex flex-wrap gap-2">
          {CHIPS.map(chip => (
            <button
              key={chip.id}
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500"
              title={chip.description}
              onClick={() => handleClick(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
