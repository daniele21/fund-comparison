import React from 'react';
import { BRAND_TOKENS } from '../config/brandTokens';
import type { PensionFund } from '../types';
import { getColorForFund } from '../utils/colorMapping';
import { formatFundLabel, formatShortFundLabel } from '../utils/fundLabel';
import CostChart from './CostChart';
import PerformanceChart from './PerformanceChart';

interface FundComparisonPdfReportProps {
  funds: PensionFund[];
  selectedFundIds: string[];
  generatedAt: Date;
}

const formatDateTime = (date: Date): string => (
  new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
);

const formatPercent = (value: number | null): string => (
  value === null ? 'n.d.' : `${value.toFixed(2)}%`
);

const formatRating = (fund: PensionFund): string => (
  fund.rating.ammissibile && fund.rating.classeRating ? fund.rating.classeRating : 'N/D'
);

const FundSummaryCard: React.FC<{
  fund: PensionFund;
  color: string;
  isBestPerformance: boolean;
  isBestCost: boolean;
}> = ({ fund, color, isBestPerformance, isBestCost }) => (
  <div
    className={`relative rounded-2xl border p-5 ${
      isBestPerformance || isBestCost
        ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200'
        : 'border-slate-200 bg-white'
    }`}
  >
    {(isBestPerformance || isBestCost) && (
      <div className="absolute -top-3 left-5 flex gap-2">
        {isBestPerformance && (
          <span className="rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Miglior rendimento
          </span>
        )}
        {isBestCost && (
          <span className="rounded-full bg-blue-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Costi minori
          </span>
        )}
      </div>
    )}

    <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
      <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-slate-950">{formatFundLabel(fund)}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {fund.type}
          {fund.categoria ? ` - ${fund.categoria}` : ''}
          {fund.societa ? ` - ${fund.societa}` : ''}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Metric label="Rating" value={formatRating(fund)} />
      <Metric label="ISC 10 anni" value={formatPercent(fund.isc.isc10a)} tone={isBestCost ? 'blue' : 'default'} />
      <Metric label="Rend. 5 anni" value={formatPercent(fund.rendimenti.ultimi5Anni)} />
      <Metric label="Rend. 10 anni" value={formatPercent(fund.rendimenti.ultimi10Anni)} tone={isBestPerformance ? 'emerald' : 'default'} />
    </div>
  </div>
);

const Metric: React.FC<{
  label: string;
  value: string;
  tone?: 'default' | 'emerald' | 'blue';
}> = ({ label, value, tone = 'default' }) => {
  const toneClass = {
    default: 'border-slate-200 bg-white text-slate-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
  }[tone];

  return (
    <div className={`rounded-xl border p-3 text-center ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
};

const FundComparisonPdfReport: React.FC<FundComparisonPdfReportProps> = ({
  funds,
  selectedFundIds,
  generatedAt,
}) => {
  if (funds.length === 0) return null;

  const bestPerformance = funds.reduce((best, fund) => {
    const currentValue = fund.rendimenti.ultimi10Anni ?? fund.rendimenti.ultimi5Anni ?? fund.rendimenti.ultimi3Anni ?? Number.NEGATIVE_INFINITY;
    const bestValue = best.rendimenti.ultimi10Anni ?? best.rendimenti.ultimi5Anni ?? best.rendimenti.ultimi3Anni ?? Number.NEGATIVE_INFINITY;
    return currentValue > bestValue ? fund : best;
  }, funds[0]);

  const bestCost = funds.reduce((best, fund) => {
    const currentValue = fund.isc.isc10a ?? fund.isc.isc5a ?? fund.costoAnnuo ?? Number.POSITIVE_INFINITY;
    const bestValue = best.isc.isc10a ?? best.isc.isc5a ?? best.costoAnnuo ?? Number.POSITIVE_INFINITY;
    return currentValue < bestValue ? fund : best;
  }, funds[0]);

  return (
    <article className="fund-comparison-print-report bg-white text-slate-950">
      <header className="print-report-section border-b border-slate-200 pb-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={BRAND_TOKENS.logo.horizontal} alt={BRAND_TOKENS.name} className="h-12 w-auto object-contain" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{BRAND_TOKENS.productName}</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-950">Report confronto fondi</h1>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Generato il</p>
            <p className="font-semibold text-slate-700">{formatDateTime(generatedAt)}</p>
          </div>
        </div>
      </header>

      <section className="print-report-section space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-950">Fondi inclusi</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Il report mostra i fondi selezionati nella sezione confronto, con rendimenti storici, ISC e rating disponibili nel dataset.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {funds.map((fund) => {
            const color = getColorForFund(fund.id, selectedFundIds);
            return (
              <div
                key={fund.id}
                className="inline-flex max-w-[300px] items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold"
                style={{ borderColor: color, color, backgroundColor: '#ffffff' }}
              >
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="truncate">{formatShortFundLabel(fund, 42)}</span>
              </div>
            );
          })}
        </div>
        <div className={`grid gap-4 ${funds.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {funds.map((fund) => (
            <FundSummaryCard
              key={fund.id}
              fund={fund}
              color={getColorForFund(fund.id, selectedFundIds)}
              isBestPerformance={funds.length > 1 && fund.id === bestPerformance.id}
              isBestCost={funds.length > 1 && fund.id === bestCost.id}
            />
          ))}
        </div>
      </section>

      <section className="print-report-section space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-950">Performance a confronto</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Rendimenti medi annui sui principali orizzonti disponibili, con benchmark TFR.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <PerformanceChart selectedFunds={funds} theme="light" />
        </div>
      </section>

      <section className="print-report-section space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-950">Costi a confronto</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            ISC sui principali orizzonti temporali. Una linea piu' bassa indica un fondo piu' efficiente.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <CostChart selectedFunds={funds} theme="light" />
        </div>
      </section>

      <footer className="print-report-section border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
        <p>I rendimenti passati non sono indicativi di quelli futuri. Il report ha scopo informativo e non costituisce consulenza finanziaria.</p>
        <p className="mt-1">Tutti i dati restano nel browser: l'esportazione usa la funzione di stampa/salva PDF del dispositivo.</p>
      </footer>
    </article>
  );
};

export default FundComparisonPdfReport;
