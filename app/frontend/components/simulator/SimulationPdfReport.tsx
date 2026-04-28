import React from 'react';
import { BRAND_TOKENS } from '../../config/brandTokens';
import type { SimulationReportModel } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/simulatorCalc';
import ComparisonMontanteChart from './ComparisonMontanteChart';
import SimulatorDisclaimer from './SimulatorDisclaimer';

interface SimulationPdfReportProps {
  model: SimulationReportModel;
}

const formatDateTime = (date: Date): string => (
  new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
);

const ReportMetric: React.FC<{
  label: string;
  value: string;
  detail?: string;
  tone?: 'default' | 'emerald' | 'blue' | 'rose';
}> = ({ label, value, detail, tone = 'default' }) => {
  const toneClass = {
    default: 'border-slate-200 bg-white text-slate-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    rose: 'border-rose-200 bg-rose-50 text-rose-800',
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      {detail && <p className="mt-1 text-xs leading-snug text-slate-500">{detail}</p>}
    </div>
  );
};

const ReportSection: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="simulation-print-section space-y-4">
    <div>
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
    {children}
  </section>
);

const FundPill: React.FC<{
  label: string;
  rate: string;
  color: string;
}> = ({ label, rate, color }) => (
  <div
    className="inline-flex max-w-[300px] items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold"
    style={{ borderColor: color, color, backgroundColor: '#ffffff' }}
  >
    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
    <span className="truncate">{label}</span>
    <span className="flex-shrink-0 opacity-70">({rate}/anno)</span>
  </div>
);

const ComparisonFundCard: React.FC<{
  result: SimulationReportModel['funds'][number];
  isBest: boolean;
  showBestBadge: boolean;
  step: 'montante' | 'fiscale' | 'netto';
}> = ({ result, isBest, showBestBadge, step }) => (
  <div
    className={`relative rounded-2xl border p-5 ${
      isBest && showBestBadge
        ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200'
        : 'border-slate-200 bg-white'
    }`}
  >
    {isBest && showBestBadge && (
      <span className="absolute -top-3 left-5 rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        Migliore
      </span>
    )}

    <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
      <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: result.color }} />
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-slate-950">{result.fund.pip} - {result.fund.linea}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {result.fund.type}
          {result.fund.societa ? ` - ${result.fund.societa}` : ''}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Rend. {result.rendimentoLabel}: <strong>{formatPercentage(result.tassoRendimento, 2)}</strong>
        </p>
      </div>
    </div>

    <div className="space-y-3">
      {step === 'montante' && (
        <>
          <ReportMetric
            label="Totale versato"
            value={formatCurrency(result.totaleVersato)}
            detail="capitale iniziale + volontario + TFR"
          />
          <ReportMetric
            label="Capitale accumulato"
            value={formatCurrency(result.montanteFinale)}
            detail="versato + rendimenti"
            tone="emerald"
          />
          <ReportMetric
            label="Guadagno dai rendimenti"
            value={`+${formatPercentage(result.rendimentoPercentuale, 1)}`}
            detail={formatCurrency(result.guadagnoRendimenti)}
            tone="emerald"
          />
        </>
      )}

      {step === 'fiscale' && (
        <>
          <ReportMetric
            label="Risparmi ogni anno"
            value={formatCurrency(result.risparmioAnnuo)}
            detail={`Aliquota IRPEF ${formatPercentage(result.aliquotaMarginale * 100, 0)}`}
            tone="emerald"
          />
          <ReportMetric
            label="Risparmio fiscale totale"
            value={formatCurrency(result.risparmioFiscaleTotale)}
            detail={`${result.anniPartecipazione} anni stimati di partecipazione`}
            tone="emerald"
          />
          <ReportMetric
            label="Capitale extra se reinvesti"
            value={`+${formatCurrency(result.differenzaMontante)}`}
            detail={`+${formatPercentage(result.differenzaPercentuale, 1)} in piu`}
            tone="blue"
          />
        </>
      )}

      {step === 'netto' && (
        <>
          <ReportMetric
            label="Capitale lordo accumulato"
            value={formatCurrency(result.montanteConFiscale)}
            detail="con reinvestimento IRPEF"
          />
          <ReportMetric
            label="Tassa alla pensione"
            value={`-${formatCurrency(result.impostaSostitutiva)}`}
            detail={`Aliquota ${formatPercentage(result.aliquotaSostitutiva * 100, 1)} (${result.anniPartecipazione} anni)`}
            tone="rose"
          />
          <ReportMetric
            label="Quello che riceverai davvero"
            value={formatCurrency(result.montanteNetto)}
            detail={`+${formatPercentage(result.rendimentoNettoPercentuale, 1)} netto vs versato`}
            tone="emerald"
          />
        </>
      )}
    </div>
  </div>
);

const SimulationPdfReport: React.FC<SimulationPdfReportProps> = ({ model }) => {
  const bestByCapital = model.funds.reduce(
    (best, current) => (current.montanteFinale > best.montanteFinale ? current : best),
    model.funds[0],
  );
  const bestByFiscal = model.funds.reduce(
    (best, current) => (current.montanteConFiscale > best.montanteConFiscale ? current : best),
    model.funds[0],
  );
  const bestByNet = model.funds.reduce(
    (best, current) => (current.montanteNetto > best.montanteNetto ? current : best),
    model.funds[0],
  );

  return (
    <article className="simulation-print-report bg-white text-slate-950">
      <header className="simulation-print-section border-b border-slate-200 pb-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={BRAND_TOKENS.logo.horizontal} alt={BRAND_TOKENS.name} className="h-12 w-auto object-contain" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{BRAND_TOKENS.productName}</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-950">Report simulazione previdenziale</h1>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Generato il</p>
            <p className="font-semibold text-slate-700">{formatDateTime(model.generatedAt)}</p>
          </div>
        </div>
      </header>

      <ReportSection
        title="Fondi inclusi"
        description="Il report usa i rendimenti storici disponibili per i fondi selezionati. Se un orizzonte lungo non e disponibile, viene usato il miglior proxy disponibile."
      >
        <div className="grid grid-cols-1 gap-3">
          {model.funds.map((result) => (
            <div key={result.fund.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: result.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-950">{result.fund.pip} - {result.fund.linea}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {result.fund.type}
                    {result.fund.societa ? ` - ${result.fund.societa}` : ''}
                    {' '}· Rendimento {result.rendimentoLabel}: <strong>{formatPercentage(result.tassoRendimento, 2)}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection
        title="Parametri simulazione"
        description="Questi valori sono quelli presenti nel simulatore al momento dell'esportazione."
      >
        <div className="grid grid-cols-3 gap-3">
          <ReportMetric label="Capitale iniziale" value={formatCurrency(model.parameters.montanteIniziale)} />
          <ReportMetric label="Contributo volontario annuo" value={formatCurrency(model.parameters.contributoVolontarioAnnuo)} />
          <ReportMetric label="TFR datore stimato" value={formatCurrency(model.parameters.tfrAnnuoDatore)} />
          <ReportMetric label="RAL" value={formatCurrency(model.parameters.ral)} />
          <ReportMetric label="Orizzonte" value={`${model.parameters.orizzonteAnni} anni`} />
          <ReportMetric label="Prima adesione" value={String(model.parameters.annoPrimaAdesione)} />
        </div>
      </ReportSection>

      <ReportSection
        title={model.funds.length > 1 ? 'Confronto fondi simulati' : 'Fondo simulato'}
        description={model.funds.length > 1
          ? 'Vista comparativa dei fondi selezionati con lo stesso schema visuale della simulazione web.'
          : 'Vista riepilogativa del fondo selezionato con gli stessi indicatori della simulazione web.'}
      >
        <div className="flex flex-wrap gap-3">
          {model.funds.map((result) => (
            <FundPill
              key={result.fund.id}
              label={`${result.fund.pip} - ${result.fund.linea}`}
              rate={formatPercentage(result.tassoRendimento, 1)}
              color={result.color}
            />
          ))}
        </div>

        <div className={`grid gap-4 ${model.funds.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {model.funds.map((result) => (
            <ComparisonFundCard
              key={result.fund.id}
              result={result}
              isBest={bestByCapital?.fund.id === result.fund.id}
              showBestBadge={model.funds.length > 1}
              step="montante"
            />
          ))}
        </div>
      </ReportSection>

      <ReportSection
        title="1. Crescita del capitale"
        description="Confronto tra capitale versato nel fondo pensione e TFR lasciato in azienda."
      >
        <div className="grid grid-cols-3 gap-3">
          {model.funds.map((result) => (
            <ReportMetric
              key={result.fund.id}
              label={result.fund.linea}
              value={formatCurrency(result.montanteFinale)}
              detail={`Rendimenti: ${formatCurrency(result.guadagnoRendimenti)} (${formatPercentage(result.rendimentoPercentuale, 1)})`}
              tone="emerald"
            />
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <ComparisonMontanteChart data={model.chartData.montante} fundsMeta={model.fundsMeta} theme="light" tfrDataKey="tfr" />
        </div>
      </ReportSection>

      <ReportSection
        title="2. Beneficio fiscale"
        description="Stima del risparmio IRPEF sui contributi volontari e impatto se il risparmio viene reinvestito."
      >
        <div className="flex flex-wrap gap-3">
          {model.funds.map((result) => (
            <FundPill
              key={result.fund.id}
              label={`${result.fund.pip} - ${result.fund.linea}`}
              rate={formatPercentage(result.tassoRendimento, 1)}
              color={result.color}
            />
          ))}
        </div>

        <div className={`grid gap-4 ${model.funds.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {model.funds.map((result) => (
            <ComparisonFundCard
              key={result.fund.id}
              result={result}
              isBest={bestByFiscal?.fund.id === result.fund.id}
              showBestBadge={model.funds.length > 1}
              step="fiscale"
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {model.funds.map((result) => (
            <ReportMetric
              key={result.fund.id}
              label={result.fund.linea}
              value={formatCurrency(result.montanteConFiscale)}
              detail={`Risparmio totale: ${formatCurrency(result.risparmioFiscaleTotale)} · Extra capitale: ${formatCurrency(result.differenzaMontante)}`}
              tone="blue"
            />
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <ComparisonMontanteChart data={model.chartData.fiscale} fundsMeta={model.fundsMeta} theme="light" tfrDataKey="tfr" />
        </div>
      </ReportSection>

      <ReportSection
        title="3. Netto stimato alla pensione"
        description="Stima del capitale netto dopo imposta sostitutiva, calcolata con l'anno di prima adesione indicato."
      >
        <div className="flex flex-wrap gap-3">
          {model.funds.map((result) => (
            <FundPill
              key={result.fund.id}
              label={`${result.fund.pip} - ${result.fund.linea}`}
              rate={formatPercentage(result.tassoRendimento, 1)}
              color={result.color}
            />
          ))}
        </div>

        <div className={`grid gap-4 ${model.funds.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {model.funds.map((result) => (
            <ComparisonFundCard
              key={result.fund.id}
              result={result}
              isBest={bestByNet?.fund.id === result.fund.id}
              showBestBadge={model.funds.length > 1}
              step="netto"
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {model.funds.map((result) => (
            <ReportMetric
              key={result.fund.id}
              label={result.fund.linea}
              value={formatCurrency(result.montanteNetto)}
              detail={`Imposta: ${formatCurrency(result.impostaSostitutiva)} · Aliquota ${formatPercentage(result.aliquotaSostitutiva * 100, 1)}`}
              tone={bestByNet?.fund.id === result.fund.id && model.funds.length > 1 ? 'emerald' : 'default'}
            />
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <ComparisonMontanteChart data={model.chartData.netto} fundsMeta={model.fundsMeta} theme="light" tfrDataKey="tfr" />
        </div>
      </ReportSection>

      <footer className="simulation-print-section pt-2">
        <SimulatorDisclaimer variant="default" />
      </footer>
    </article>
  );
};

export default SimulationPdfReport;
