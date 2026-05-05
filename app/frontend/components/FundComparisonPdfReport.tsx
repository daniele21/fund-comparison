import React from 'react';
import type { PensionFund } from '../types';
import {
  PDF_REPORT_DISCLAIMER,
  PdfMetric,
  PdfNarrative,
  PdfPage,
  PdfSection,
} from './reports/PdfReportLayout';
import {
  buildComparisonSummary,
  buildCostConclusion,
  describeFund,
  getBestCostFund,
  getBestPerformanceFund,
  getBestRatingFund,
} from '../utils/pdfReportNarratives';
import { getColorForFund } from '../utils/colorMapping';
import { formatShortFundLabel } from '../utils/fundLabel';
import CostChart from './CostChart';
import PerformanceChart from './PerformanceChart';

interface FundComparisonPdfReportProps {
  funds: PensionFund[];
  selectedFundIds: string[];
  generatedAt: Date;
  customerEmail?: string | null;
}

const formatPercent = (value: number | null): string => (
  value === null ? 'n.d.' : `${value.toFixed(2)}%`
);

const formatRating = (fund: PensionFund): string => (
  fund.rating.ammissibile && fund.rating.classeRating ? fund.rating.classeRating : 'N/D'
);

const FundRow: React.FC<{
  fund: PensionFund;
  selectedFundIds: string[];
}> = ({ fund, selectedFundIds }) => (
  <div className="pdf-fund-row">
    <span style={{ backgroundColor: getColorForFund(fund.id, selectedFundIds) }} />
    <div>
      <strong>{formatShortFundLabel(fund, 62)}</strong>
      <small>
        {fund.type} - {fund.categoria}
        {fund.societa ? ` - ${fund.societa}` : ''}
      </small>
    </div>
  </div>
);

const FundDescriptionGrid: React.FC<{
  funds: PensionFund[];
  selectedFundIds: string[];
}> = ({ funds, selectedFundIds }) => (
  <div className="pdf-description-grid">
    {funds.map((fund, index) => (
      <div key={fund.id} className="pdf-fund-description">
        <div className="pdf-fund-description-title">
          <span style={{ backgroundColor: getColorForFund(fund.id, selectedFundIds) }} />
          <strong>Fondo {index + 1}</strong>
        </div>
        <h3>{formatShortFundLabel(fund, 42)}</h3>
        <p>{describeFund(fund)}</p>
      </div>
    ))}
  </div>
);

const ComparisonTable: React.FC<{ funds: PensionFund[] }> = ({ funds }) => (
  <div className="pdf-table">
    <div className="pdf-table-row pdf-table-head">
      <span>Fondo</span>
      <span>Rend. 10 anni</span>
      <span>ISC 10 anni</span>
      <span>Rating</span>
    </div>
    {funds.map((fund) => (
      <div key={fund.id} className="pdf-table-row">
        <span>{formatShortFundLabel(fund, 30)}</span>
        <span>{formatPercent(fund.rendimenti.ultimi10Anni)}</span>
        <span>{formatPercent(fund.isc.isc10a)}</span>
        <span>{formatRating(fund)}</span>
      </div>
    ))}
  </div>
);

const FundComparisonPdfReport: React.FC<FundComparisonPdfReportProps> = ({
  funds,
  selectedFundIds,
  generatedAt,
  customerEmail,
}) => {
  if (funds.length === 0) return null;

  const bestPerformance = getBestPerformanceFund(funds);
  const bestCost = getBestCostFund(funds);
  const bestRating = getBestRatingFund(funds);

  return (
    <article className="fund-comparison-print-report pdf-report bg-white text-slate-950">
      <PdfPage
        title="Report confronto fondi"
        generatedAt={generatedAt}
        pageNumber={1}
        customerEmail={customerEmail}
      >
        <div className="pdf-split pdf-split--top">
          <PdfSection title="Fondi analizzati">
            <div className="pdf-fund-list">
              {funds.map((fund) => (
                <FundRow key={fund.id} fund={fund} selectedFundIds={selectedFundIds} />
              ))}
            </div>
          </PdfSection>

          <PdfSection title="Disclaimer">
            <PdfNarrative compact>{PDF_REPORT_DISCLAIMER}</PdfNarrative>
          </PdfSection>
        </div>

        <div className="pdf-highlight-strip">
          <PdfMetric label="Miglior rendimento" value={formatShortFundLabel(bestPerformance, 30)} detail={formatPercent(bestPerformance.rendimenti.ultimi10Anni ?? bestPerformance.rendimenti.ultimi5Anni)} tone="positive" />
          <PdfMetric label="Costi minori" value={formatShortFundLabel(bestCost, 30)} detail={formatPercent(bestCost.isc.isc10a ?? bestCost.isc.isc5a)} tone="accent" />
          <PdfMetric label="Rating migliore" value={bestRating ? formatShortFundLabel(bestRating, 30) : 'N/D'} detail={bestRating ? formatRating(bestRating) : 'non disponibile'} />
        </div>

        <PdfSection title="Executive Summary">
          <PdfNarrative>
            {buildComparisonSummary(funds, bestPerformance, bestCost, bestRating)}
          </PdfNarrative>
          <ComparisonTable funds={funds} />
        </PdfSection>
      </PdfPage>

      <PdfPage
        title="Report confronto fondi"
        generatedAt={generatedAt}
        pageNumber={2}
        customerEmail={customerEmail}
      >
        <PdfSection title="Confronto Performance">
          <div className="pdf-chart-panel pdf-chart-panel--large">
            <PerformanceChart selectedFunds={funds} theme="light" isCompact />
          </div>
          <FundDescriptionGrid funds={funds} selectedFundIds={selectedFundIds} />
        </PdfSection>
      </PdfPage>

      <PdfPage
        title="Report confronto fondi"
        generatedAt={generatedAt}
        pageNumber={3}
        customerEmail={customerEmail}
      >
        <PdfSection title="Confronto costi">
          <div className="pdf-chart-panel pdf-chart-panel--large">
            <CostChart selectedFunds={funds} theme="light" isCompact />
          </div>
          <PdfNarrative compact>
            {buildCostConclusion(bestPerformance, bestCost)}
          </PdfNarrative>
          <ComparisonTable funds={funds} />
        </PdfSection>
      </PdfPage>
    </article>
  );
};

export default FundComparisonPdfReport;
