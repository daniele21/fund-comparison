import type { PensionFund } from '../types';
import { formatAttributeStatus, getCapitalGuaranteeStatus, getEsgStatus } from '../utils/fundAttributes';
import { formatFundLabel } from '../utils/fundLabel';

interface FundComparisonTableProps { funds: PensionFund[]; }

const COST_ROWS = [
  ['Adesione', 'adesione'], ['Gestione annua', 'annuiGestione'], ['Gestione finanziaria', 'gestioneFinanziaria'],
  ['Anticipazione', 'anticipazione'], ['Trasferimento', 'trasferimento'], ['Riscatto', 'riscatto'],
  ['Riallocazione posizione', 'riallocazionePosizione'], ['Riallocazione flusso', 'riallocazioneFlussoContributivo'], ['Erogazione', 'erogazione'],
] as const;

const FundComparisonTable: React.FC<FundComparisonTableProps> = ({ funds }) => {
  if (funds.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/50" aria-labelledby="comparison-details-title">
      <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
        <h3 id="comparison-details-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">Dettagli comparativi</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Garanzia, sostenibilità e costi operativi dichiarati nelle fonti del comparto.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
            <tr>
              <th scope="col" className="sticky left-0 z-10 min-w-52 bg-slate-50 px-4 py-3 font-semibold dark:bg-slate-900/70">Voce</th>
              {funds.map((fund) => <th key={fund.id} scope="col" className="min-w-56 px-4 py-3 font-semibold">{formatFundLabel(fund)}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-200">Garanzia del capitale</th>
              {funds.map((fund) => <td key={fund.id} className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatAttributeStatus(getCapitalGuaranteeStatus(fund))}</td>)}
            </tr>
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-200">ESG</th>
              {funds.map((fund) => <td key={fund.id} className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatAttributeStatus(getEsgStatus(fund))}</td>)}
            </tr>
            {COST_ROWS.map(([label, key]) => (
              <tr key={key}>
                <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-200">{label}</th>
                {funds.map((fund) => <td key={fund.id} className="px-4 py-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{fund.costiDettaglio[key] ?? 'Non disponibile'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default FundComparisonTable;
