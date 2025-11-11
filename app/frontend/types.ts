export interface PensionFund {
  id: string;
  type: 'FPN' | 'FPA' | 'PIP';
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
}

export type FundCategory = 'GAR' | 'BIL' | 'AZN' | 'OBB MISTO' | 'OBB PURO' | 'OBB';

export type SortableKey = keyof PensionFund | 'ultimoAnno' | 'ultimi3Anni' | 'ultimi5Anni' | 'ultimi10Anni' | 'ultimi20Anni' | 'selected';

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
  roles?: string[];
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
  /** Optional: category of the contractual FPN (if known) to prefer similar funds */
  contractualFpnCategory?: FundCategory;
  monthlyContribution?: number;
};
