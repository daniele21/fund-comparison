import type { PensionFund, SimulationFundResult, SimulationReportModel } from '../types';
import { formatFundLabel } from './fundLabel';
import { formatCurrency, formatPercentage } from './simulatorCalc';

const formatPercentValue = (value: number | null): string => (
  value === null ? 'non disponibile' : `${value.toFixed(2)}%`
);

const getPerformanceValue = (fund: PensionFund): number => (
  fund.rendimenti.ultimi10Anni
  ?? fund.rendimenti.ultimi5Anni
  ?? fund.rendimenti.ultimi3Anni
  ?? Number.NEGATIVE_INFINITY
);

const getCostValue = (fund: PensionFund): number => (
  fund.isc.isc10a
  ?? fund.isc.isc5a
  ?? fund.costoAnnuo
  ?? Number.POSITIVE_INFINITY
);

export const describeFund = (fund: PensionFund): string => {
  const rating = fund.rating.ammissibile && fund.rating.classeRating
    ? `rating ${fund.rating.classeRating}`
    : 'rating non disponibile';
  const performance = formatPercentValue(fund.rendimenti.ultimi10Anni ?? fund.rendimenti.ultimi5Anni);
  const cost = formatPercentValue(fund.isc.isc10a ?? fund.isc.isc5a);

  return `${fund.type} ${fund.categoria}${fund.societa ? ` gestito da ${fund.societa}` : ''}. Presenta ${rating}, rendimento storico di riferimento pari a ${performance} e ISC di riferimento pari a ${cost}.`;
};

export const buildSingleSimulationSummary = (model: SimulationReportModel, result: SimulationFundResult): string => (
  `La simulazione considera ${formatFundLabel(result.fund)} su un orizzonte di ${model.parameters.orizzonteAnni} anni. Con un capitale iniziale di ${formatCurrency(model.parameters.montanteIniziale)}, contributi volontari annui di ${formatCurrency(model.parameters.contributoVolontarioAnnuo)} e TFR datore stimato di ${formatCurrency(model.parameters.tfrAnnuoDatore)}, il montante lordo stimato e' ${formatCurrency(result.montanteFinale)}. Il rendimento storico utilizzato e' ${formatPercentage(result.tassoRendimento, 2)} annuo, basato sul proxy ${result.rendimentoLabel}.`
);

export const buildCapitalGrowthComment = (result: SimulationFundResult): string => (
  `Il capitale cresce progressivamente per effetto dei versamenti e della capitalizzazione dei rendimenti. A fine periodo il totale versato stimato e' ${formatCurrency(result.totaleVersato)}, mentre il guadagno attribuibile ai rendimenti e' ${formatCurrency(result.guadagnoRendimenti)}, pari a ${formatPercentage(result.rendimentoPercentuale, 1)} rispetto ai versamenti complessivi.`
);

export const buildFiscalBenefitComment = (model: SimulationReportModel, result: SimulationFundResult): string => (
  `Considerando un'aliquota IRPEF marginale del ${formatPercentage(result.aliquotaMarginale * 100, 0)} relativamente alla RAL dichiarata, il risparmio fiscale annuo stimato e' ${formatCurrency(result.risparmioAnnuo)}. Sull'orizzonte di ${model.parameters.orizzonteAnni} anni il beneficio complessivo e' ${formatCurrency(result.risparmioFiscaleTotale)}; se reinvestito nel fondo, genera capitale extra stimato per ${formatCurrency(result.differenzaMontante)}.`
);

export const buildNetPensionComment = (result: SimulationFundResult): string => (
  `In funzione della durata di adesione al fondo pensione, la tassazione applicata alla prestazione puo' ridursi al crescere degli anni di partecipazione. In questa simulazione l'anzianita' stimata e' ${result.anniPartecipazione} anni e determina un'aliquota sostitutiva del ${formatPercentage(result.aliquotaSostitutiva * 100, 1)}. Il montante netto alla pensione e' quindi pari a ${formatCurrency(result.montanteNetto)}.`
);

export const buildComparisonSummary = (
  funds: PensionFund[],
  bestPerformance: PensionFund,
  bestCost: PensionFund,
  bestRating: PensionFund | null,
): string => {
  const ratingText = bestRating
    ? ` Il rating sintetico piu' elevato tra i fondi selezionati e' quello di ${formatFundLabel(bestRating)}.`
    : '';

  return `Il confronto analizza ${funds.length} fond${funds.length === 1 ? 'o' : 'i'} pensione sulla base di rendimenti storici, costi ISC e rating disponibili. Il miglior rendimento storico di riferimento e' di ${formatFundLabel(bestPerformance)}, mentre il profilo di costo piu' efficiente e' quello di ${formatFundLabel(bestCost)}. I parametri piu' determinanti sono rendimenti a 5 e 10 anni, ISC a 10 anni e coerenza storica generale.${ratingText}`;
};

export const buildCostConclusion = (
  bestPerformance: PensionFund,
  bestCost: PensionFund,
): string => (
  `L'analisi dei costi mostra quanto l'ISC possa incidere sul risultato nel tempo, soprattutto su orizzonti lunghi come 10, 20 e 30 anni. Un fondo con costi piu' bassi conserva piu' montante a parita' di rendimento, mentre un rendimento storico piu' alto puo' compensare solo parzialmente un costo elevato. Sulla base dei dati disponibili, ${formatFundLabel(bestPerformance)} emerge per rendimento storico e ${formatFundLabel(bestCost)} per efficienza di costo. La valutazione resta basata su dati passati e non rappresenta garanzia di rendimenti futuri.`
);

export const getBestPerformanceFund = (funds: PensionFund[]): PensionFund => (
  funds.reduce((best, fund) => (getPerformanceValue(fund) > getPerformanceValue(best) ? fund : best), funds[0])
);

export const getBestCostFund = (funds: PensionFund[]): PensionFund => (
  funds.reduce((best, fund) => (getCostValue(fund) < getCostValue(best) ? fund : best), funds[0])
);

export const getBestRatingFund = (funds: PensionFund[]): PensionFund | null => {
  const eligible = funds.filter((fund) => typeof fund.rating.ratingScore === 'number');
  if (eligible.length === 0) return null;
  return eligible.reduce((best, fund) => {
    const currentScore = fund.rating.ratingScore ?? Number.NEGATIVE_INFINITY;
    const bestScore = best.rating.ratingScore ?? Number.NEGATIVE_INFINITY;
    return currentScore > bestScore ? fund : best;
  }, eligible[0]);
};
