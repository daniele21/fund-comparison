import React from 'react';
import type { SimulationFundResult, SimulationReportModel } from '../../types';
import {
  PDF_REPORT_DISCLAIMER,
  PdfMetric,
  PdfNarrative,
  PdfPage,
  PdfSection,
} from '../reports/PdfReportLayout';
import {
  buildCapitalGrowthComment,
  buildFiscalBenefitComment,
  buildNetPensionComment,
  buildSingleSimulationSummary,
  describeFund,
} from '../../utils/pdfReportNarratives';
import { formatShortFundLabel } from '../../utils/fundLabel';
import { formatCurrency, formatPercentage } from '../../utils/simulatorCalc';
import ComparisonMontanteChart from './ComparisonMontanteChart';

interface SimulationPdfReportProps {
  model: SimulationReportModel;
  isPrinting?: boolean;
}

const getBestBy = (
  funds: SimulationFundResult[],
  selector: (fund: SimulationFundResult) => number,
): SimulationFundResult => (
  funds.reduce((best, current) => (selector(current) > selector(best) ? current : best), funds[0])
);

const FundRow: React.FC<{ result: SimulationFundResult }> = ({ result }) => (
  <div className="pdf-fund-row">
    <span style={{ backgroundColor: result.color }} />
    <div>
      <strong>{formatShortFundLabel(result.fund, 62)}</strong>
      <small>
        {result.fund.type} - {result.fund.categoria}
        {result.fund.societa ? ` - ${result.fund.societa}` : ''}
      </small>
    </div>
  </div>
);

const FundResultTable: React.FC<{
  funds: SimulationFundResult[];
  metric: 'montante' | 'fiscale' | 'netto';
}> = ({ funds, metric }) => {
  const valueFor = (result: SimulationFundResult): string => {
    if (metric === 'montante') return formatCurrency(result.montanteFinale);
    if (metric === 'fiscale') return formatCurrency(result.montanteConFiscale);
    return formatCurrency(result.montanteNetto);
  };

  return (
    <div className="pdf-table">
      <div className="pdf-table-row pdf-table-head">
        <span>Fondo</span>
        <span>Rendimento</span>
        <span>Risultato</span>
      </div>
      {funds.map((result) => (
        <div key={result.fund.id} className="pdf-table-row">
          <span>{formatShortFundLabel(result.fund, 36)}</span>
          <span>{formatPercentage(result.tassoRendimento, 2)}</span>
          <span>{valueFor(result)}</span>
        </div>
      ))}
    </div>
  );
};

const SimulationPdfReport: React.FC<SimulationPdfReportProps> = ({ model, isPrinting = false }) => {
  if (model.funds.length === 0) return null;

  const primaryResult = model.funds[0];
  const bestByCapital = getBestBy(model.funds, (fund) => fund.montanteFinale);
  const bestByFiscal = getBestBy(model.funds, (fund) => fund.montanteConFiscale);
  const bestByNet = getBestBy(model.funds, (fund) => fund.montanteNetto);
  const focusForSummary = model.funds.length > 1 ? bestByNet : primaryResult;

  return (
    <article className={`simulation-print-report pdf-report bg-white text-slate-950${isPrinting ? ' pdf-report--printing' : ''}`}>
      <PdfPage
        title="Report simulazione previdenziale"
        generatedAt={model.generatedAt}
        pageNumber={1}
        customerEmail={model.customerEmail}
      >
        <div className="pdf-split pdf-split--top">
          <PdfSection title={model.funds.length > 1 ? 'Fondi analizzati' : 'Fondo analizzato'}>
            <div className="pdf-fund-list">
              {model.funds.map((result) => <FundRow key={result.fund.id} result={result} />)}
            </div>
          </PdfSection>

          <PdfSection title="Disclaimer">
            <PdfNarrative compact>{PDF_REPORT_DISCLAIMER}</PdfNarrative>
          </PdfSection>
        </div>

        <PdfSection title="Parametri simulazione">
          <div className="pdf-metric-grid pdf-metric-grid--six">
            <PdfMetric label="Capitale iniziale" value={formatCurrency(model.parameters.montanteIniziale)} />
            <PdfMetric label="RAL" value={formatCurrency(model.parameters.ral)} />
            <PdfMetric label="Contributo vol. annuo" value={formatCurrency(model.parameters.contributoVolontarioAnnuo)} />
            <PdfMetric label="TFR datore stimato" value={formatCurrency(model.parameters.tfrAnnuoDatore)} />
            <PdfMetric label="Orizzonte" value={`${model.parameters.orizzonteAnni} anni`} />
            <PdfMetric label="Prima adesione" value={String(model.parameters.annoPrimaAdesione)} />
          </div>
        </PdfSection>

        <PdfSection title="Executive Summary">
          <PdfNarrative>
            {buildSingleSimulationSummary(model, focusForSummary)}
          </PdfNarrative>
          {model.funds.length > 1 && (
            <div className="pdf-highlight-strip">
              <PdfMetric label="Miglior capitale lordo" value={formatShortFundLabel(bestByCapital.fund, 28)} detail={formatCurrency(bestByCapital.montanteFinale)} tone="positive" />
              <PdfMetric label="Miglior beneficio fiscale" value={formatShortFundLabel(bestByFiscal.fund, 28)} detail={formatCurrency(bestByFiscal.montanteConFiscale)} tone="accent" />
              <PdfMetric label="Miglior netto stimato" value={formatShortFundLabel(bestByNet.fund, 28)} detail={formatCurrency(bestByNet.montanteNetto)} tone="positive" />
            </div>
          )}
        </PdfSection>
      </PdfPage>

      <PdfPage
        title="Report simulazione previdenziale"
        generatedAt={model.generatedAt}
        pageNumber={2}
        customerEmail={model.customerEmail}
      >
        <PdfSection eyebrow="1" title="Crescita del capitale nel tempo">
          <div className="pdf-chart-panel pdf-chart-panel--large">
            <ComparisonMontanteChart data={model.chartData.montante} fundsMeta={model.fundsMeta} theme="light" tfrDataKey="tfr" />
          </div>
          <div className="pdf-metric-grid pdf-metric-grid--three">
            <PdfMetric label="Totale versato" value={formatCurrency(focusForSummary.totaleVersato)} />
            <PdfMetric label="Capitale accumulato" value={formatCurrency(bestByCapital.montanteFinale)} tone="positive" />
            <PdfMetric label="Rendimento stimato" value={`+${formatPercentage(bestByCapital.rendimentoPercentuale, 1)}`} detail={formatCurrency(bestByCapital.guadagnoRendimenti)} tone="positive" />
          </div>
          <PdfNarrative compact>
            {buildCapitalGrowthComment(bestByCapital)}
          </PdfNarrative>
        </PdfSection>

        <PdfSection eyebrow="2" title="Beneficio fiscale">
          <div className="pdf-metric-grid pdf-metric-grid--four">
            <PdfMetric label="Risparmio fiscale totale" value={formatCurrency(bestByFiscal.risparmioFiscaleTotale)} tone="positive" />
            <PdfMetric label="Capitale extra se reinvestito" value={`+${formatCurrency(bestByFiscal.differenzaMontante)}`} tone="accent" />
            <PdfMetric label="Aliquota IRPEF" value={formatPercentage(bestByFiscal.aliquotaMarginale * 100, 0)} />
            <PdfMetric label="Risparmio fiscale annuo" value={formatCurrency(bestByFiscal.risparmioAnnuo)} />
          </div>
          <PdfNarrative compact>
            {buildFiscalBenefitComment(model, bestByFiscal)}
          </PdfNarrative>
        </PdfSection>
      </PdfPage>

      <PdfPage
        title="Report simulazione previdenziale"
        generatedAt={model.generatedAt}
        pageNumber={3}
        customerEmail={model.customerEmail}
      >
        <PdfSection eyebrow="3" title="Netto stimato alla pensione">
          <PdfNarrative compact>
            {buildNetPensionComment(bestByNet)}
          </PdfNarrative>
          <div className="pdf-metric-grid pdf-metric-grid--three">
            <PdfMetric label="Capitale lordo con beneficio" value={formatCurrency(bestByNet.montanteConFiscale)} />
            <PdfMetric label="Imposta stimata" value={`-${formatCurrency(bestByNet.impostaSostitutiva)}`} detail={formatPercentage(bestByNet.aliquotaSostitutiva * 100, 1)} tone="warning" />
            <PdfMetric label="Netto stimato" value={formatCurrency(bestByNet.montanteNetto)} detail={`+${formatPercentage(bestByNet.rendimentoNettoPercentuale, 1)} vs versato`} tone="positive" />
          </div>
          <div className="pdf-chart-panel">
            <ComparisonMontanteChart data={model.chartData.netto} fundsMeta={model.fundsMeta} theme="light" tfrDataKey="tfr" />
          </div>
        </PdfSection>

        <PdfSection title="Confronto con TFR in azienda">
          <FundResultTable funds={model.funds} metric="netto" />
          <PdfNarrative compact>
            {describeFund(bestByNet.fund)}
          </PdfNarrative>
        </PdfSection>
      </PdfPage>
    </article>
  );
};

export default SimulationPdfReport;
