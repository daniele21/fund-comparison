import type {
  PensionFund,
  SimulationFundResult,
  SimulationReportChartPoint,
  SimulationReportInput,
  SimulationReportModel,
} from '../types';
import { CHART_COLORS } from './colorMapping';
import { formatShortFundLabel } from './fundLabel';
import {
  calcolaAliquotaSostitutiva,
  calcolaMontante,
  calcolaMontanteTFR,
  calcolaRisparmioFiscaleAnnuo,
  calcolaTfrAnnuoDaRal,
  getRendimentoProxyWithLabel,
} from './simulatorCalc';

const DEFAULT_RENDIMENTO_ANNUO = 5.0;

const buildBaseChartData = (
  montanteIniziale: number,
  contributoTotaleAnnuo: number,
  orizzonteAnni: number,
): SimulationReportChartPoint[] => {
  const tfrSerie = calcolaMontanteTFR(montanteIniziale, contributoTotaleAnnuo, orizzonteAnni);

  return Array.from({ length: orizzonteAnni + 1 }, (_, anno) => ({
    anno,
    tfr: tfrSerie[anno] ?? 0,
  }));
};

const addFundSeries = (
  chartData: SimulationReportChartPoint[],
  dataKey: string,
  serie: number[],
): SimulationReportChartPoint[] => (
  chartData.map((point, index) => ({
    ...point,
    [dataKey]: serie[index] ?? 0,
  }))
);

export const buildSimulationReportModel = (input: SimulationReportInput): SimulationReportModel => {
  const {
    funds,
    montanteIniziale,
    contributoVolontarioAnnuo,
    orizzonteAnni,
    ral,
    annoPrimaAdesione,
    generatedAt,
  } = input;

  const annoCorrente = generatedAt.getFullYear();
  const tfrAnnuoDatore = calcolaTfrAnnuoDaRal(ral);
  const contributoTotaleAnnuo = contributoVolontarioAnnuo + tfrAnnuoDatore;
  const { risparmioAnnuo, aliquotaMarginale } = calcolaRisparmioFiscaleAnnuo(contributoVolontarioAnnuo, ral);
  const contributoConRisparmio = contributoTotaleAnnuo + risparmioAnnuo;
  const { aliquota: aliquotaSostitutiva, anniPartecipazione } = calcolaAliquotaSostitutiva(
    annoPrimaAdesione,
    annoCorrente,
    orizzonteAnni,
  );

  let chartMontante = buildBaseChartData(montanteIniziale, contributoTotaleAnnuo, orizzonteAnni);
  let chartFiscale = buildBaseChartData(montanteIniziale, contributoTotaleAnnuo, orizzonteAnni);
  let chartNetto = buildBaseChartData(montanteIniziale, contributoTotaleAnnuo, orizzonteAnni);

  const reportFunds: SimulationFundResult[] = funds.map((fund, index) => {
    const proxyInfo = getRendimentoProxyWithLabel(fund);
    const tassoRendimento = proxyInfo?.rate ?? DEFAULT_RENDIMENTO_ANNUO;
    const rendimentoLabel = proxyInfo?.label ?? 'predefinito';
    const rendimentoYears = proxyInfo?.years ?? 10;
    const color = CHART_COLORS[index % CHART_COLORS.length];
    const dataKey = `fund_${index}`;

    const serieMontante = calcolaMontante(montanteIniziale, contributoTotaleAnnuo, tassoRendimento, orizzonteAnni);
    const serieFiscale = calcolaMontante(montanteIniziale, contributoConRisparmio, tassoRendimento, orizzonteAnni);
    const serieNetto = serieFiscale.map((value) => value * (1 - aliquotaSostitutiva));

    chartMontante = addFundSeries(chartMontante, dataKey, serieMontante);
    chartFiscale = addFundSeries(chartFiscale, dataKey, serieFiscale);
    chartNetto = addFundSeries(chartNetto, dataKey, serieNetto);

    const totaleVersato = montanteIniziale + contributoTotaleAnnuo * orizzonteAnni;
    const montanteFinale = serieMontante[orizzonteAnni] ?? 0;
    const montanteConFiscale = serieFiscale[orizzonteAnni] ?? 0;
    const montanteNetto = montanteConFiscale * (1 - aliquotaSostitutiva);
    const guadagnoRendimenti = montanteFinale - totaleVersato;
    const rendimentoPercentuale = totaleVersato > 0 ? (montanteFinale / totaleVersato - 1) * 100 : 0;
    const risparmioFiscaleTotale = risparmioAnnuo * orizzonteAnni;
    const differenzaMontante = montanteConFiscale - montanteFinale;
    const differenzaPercentuale = montanteFinale > 0 ? (differenzaMontante / montanteFinale) * 100 : 0;
    const impostaSostitutiva = montanteConFiscale * aliquotaSostitutiva;
    const rendimentoNettoPercentuale = totaleVersato > 0 ? (montanteNetto / totaleVersato - 1) * 100 : 0;

    return {
      fund,
      color,
      dataKey,
      tassoRendimento,
      rendimentoLabel,
      rendimentoYears,
      totaleVersato,
      montanteFinale,
      guadagnoRendimenti,
      rendimentoPercentuale,
      risparmioAnnuo,
      risparmioFiscaleTotale,
      montanteConFiscale,
      differenzaMontante,
      differenzaPercentuale,
      aliquotaMarginale,
      aliquotaSostitutiva,
      anniPartecipazione,
      montanteNetto,
      impostaSostitutiva,
      rendimentoNettoPercentuale,
    };
  });

  return {
    generatedAt,
    parameters: {
      montanteIniziale,
      contributoVolontarioAnnuo,
      tfrAnnuoDatore,
      contributoTotaleAnnuo,
      ral,
      orizzonteAnni,
      annoPrimaAdesione,
    },
    funds: reportFunds,
    fundsMeta: reportFunds.map((result) => ({
      dataKey: result.dataKey,
      label: formatShortFundLabel(result.fund, 28),
      color: result.color,
    })),
    chartData: {
      montante: chartMontante,
      fiscale: chartFiscale,
      netto: chartNetto,
    },
  };
};
