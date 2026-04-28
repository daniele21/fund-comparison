import React from 'react';
import { Download, FileText } from 'lucide-react';
import { PensionFund } from '@/types';
import { useGuidedComparator, MAX_SELECTED_FUNDS, MIN_SELECTED_FUNDS_FOR_COMPARE } from './guided/GuidedComparatorContext';
import SelectedFundsBar from './SelectedFundsBar';
import PerformanceChart from './PerformanceChart';
import CostChart from './CostChart';
import FundComparisonPdfReport from './FundComparisonPdfReport';

interface VisualComparisonProps {
  appSelectedFunds: PensionFund[];
  fundById: Map<string, PensionFund>;
  theme: string;
}

const VisualComparison: React.FC<VisualComparisonProps> = ({ appSelectedFunds, fundById, theme }) => {
  const { selectedFundIds, toggleSelectedFund, clearSelectedFunds } = useGuidedComparator();
  const [reportGeneratedAt, setReportGeneratedAt] = React.useState(() => new Date());
  const [printQueued, setPrintQueued] = React.useState(false);

  const guidedSelected = React.useMemo(() => {
    if (!selectedFundIds || selectedFundIds.length === 0) return null;
    return selectedFundIds.map(id => fundById.get(id)).filter((f): f is PensionFund => !!f);
  }, [selectedFundIds, fundById]);

  const fundsToShow = guidedSelected && guidedSelected.length > 0 ? guidedSelected : appSelectedFunds;
  const exportFundIds = React.useMemo(() => fundsToShow.map((fund) => fund.id), [fundsToShow]);
  const canExportPdf = fundsToShow.length >= 1;

  const handleExportPdf = React.useCallback(() => {
    if (!canExportPdf) return;
    setReportGeneratedAt(new Date());
    setPrintQueued(true);
  }, [canExportPdf]);

  React.useEffect(() => {
    if (!printQueued || !canExportPdf) return;

    const frameId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.print();
        setPrintQueued(false);
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [canExportPdf, printQueued]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Esporta confronto in PDF</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {canExportPdf
                ? `Il report includera ${fundsToShow.length === 1 ? 'il fondo selezionato' : `${fundsToShow.length} fondi selezionati`}, performance, costi e riepilogo rating.`
                : 'Seleziona almeno un fondo per esportare il report di confronto.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={!canExportPdf}
          aria-disabled={!canExportPdf}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            canExportPdf
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:outline-blue-600'
              : 'cursor-not-allowed border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500'
          }`}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Esporta PDF
        </button>
      </div>

      <SelectedFundsBar
        selectedFunds={fundsToShow}
        selectedFundIds={selectedFundIds}
        onToggleFund={(id: string) => toggleSelectedFund(id)}
        onClearAll={() => clearSelectedFunds()}
        isHeaderVisible={false}
        maxFunds={MAX_SELECTED_FUNDS}
      />

      {fundsToShow.length < MIN_SELECTED_FUNDS_FOR_COMPARE && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Seleziona almeno 2 fondi (massimo 3) per attivare il confronto completo.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
          <PerformanceChart selectedFunds={fundsToShow} theme={theme} />
        </div>
        <div className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
          <CostChart selectedFunds={fundsToShow} theme={theme} />
        </div>
      </div>

      <FundComparisonPdfReport
        funds={fundsToShow}
        selectedFundIds={exportFundIds}
        generatedAt={reportGeneratedAt}
      />
    </div>
  );
};

export default VisualComparison;
