export interface PensionFund {
  id: string;
  type: FundType;
  societa: string | null;
  pip: string; // "fondo" from CSV
  nAlbo: number;
  linea: string; // "comparto" from CSV
  ramo: string | null; // This is missing from new data, will be null
  categoria: FundCategory;
  isc: {
    isc2a: number | null;
    isc5a: number | null;
    isc10a: number | null;
    isc35a: number | null;
  };
  costoAnnuo: number | null; // Will map isc5a here for simplicity in existing components
  rendimenti: {
    ultimoAnno: number | null;
    ultimi3Anni: number | null;
    ultimi5Anni: number | null;
    ultimi10Anni: number | null;
    ultimi20Anni: number | null;
  };
  categoriaContratto: string | null; // Category/Contract reference (FPN funds only)
  sitoWeb: string | null; // Website (FPN funds only)
  rating: FundRating;
}

export type FundType = 'FPN' | 'FPA' | 'PIP';
export type FundCategory = 'GAR' | 'BIL' | 'AZN' | 'OBB MISTO' | 'OBB PURO' | 'OBB';
export type TipoAdesione = 'individuale' | 'collettiva';
export type RatingIscOrizzonte = '10y' | '5y';
export type FundRatingClass = 'A' | 'B' | 'C' | 'D' | 'E';

export interface FundRatingScores {
  score3y: number | null;
  score5y: number | null;
  score10y: number | null;
  score15y: number | null;
  score20y: number | null;
  score25y: number | null;
}

export interface FundRating {
  ammissibile: boolean;
  motivoEsclusione: string | null;
  iscUtilizzato: number | null;
  iscOrizzonte: RatingIscOrizzonte | null;
  scores: FundRatingScores;
  ratingScore: number | null;
  classeRating: FundRatingClass | null;
  descrizioneRating: string | null;
  tipoAdesione: TipoAdesione;
}

export type SortableKey = keyof PensionFund | 'ultimoAnno' | 'ultimi3Anni' | 'ultimi5Anni' | 'ultimi10Anni' | 'ultimi20Anni' | 'ratingScore' | 'selected';

export interface SortConfig {
  key: SortableKey;
  direction: 'ascending' | 'descending';
}

// Auth user returned by the API
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  plan?: 'free' | 'full-access';
  status?: 'pending' | 'active' | 'suspended' | 'rejected';
  roles?: string[];
  isAdmin?: boolean;
}

export type EntryMode = 'check-fund' | 'choose-fund' | 'learn' | null;

export type AgeRange = 'under35' | '35-50' | 'over50';

export type RiskPreference = 'low' | 'medium' | 'high';

export type WorkerType = 'dipendente' | 'autonomo' | 'altro';

export type UserProfile = {
  ageRange?: AgeRange;
  horizonYears?: number;
  riskPreference?: RiskPreference;
  workerType?: WorkerType;
  hasFpn?: boolean;
  /** Optional: contractual category name (e.g., "Metalmeccanici") to prefer matching FPN funds */
  contractualFpnCategory?: string;
  monthlyContribution?: number;
};

// Simulator types
export interface SimulatorInput {
  montanteIniziale: number;
  contributoAnnuo: number;
  orizzonteAnni: number;
  ral: number;
  annoPrimaAdesione: number;
  tassoRendimento: number; // From selected fund(s)
}

export interface MontanteSeriesPoint {
  anno: number;
  montanteSenzaFiscale: number;
  montanteConFiscale: number;
  montanteTFR: number;
  versatoCumulato?: number;
}

export interface SimulatorResult {
  series: MontanteSeriesPoint[];
  totaleVersato: number;
  montanteLordoSenzaFiscale: number;
  montanteLordoConFiscale: number;
  rendimentoTotale: number;
  risparmioFiscaleAnnuo: number;
  risparmioFiscaleTotale: number;
  aliquotaMarginaleIRPEF: number;
  anniPartecipazione: number;
  aliquotaSostitutiva: number;
  impostaSostitutiva: number;
  montanteNetto: number;
  rendimentoNettoPercentuale: number;
}
