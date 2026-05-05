export const BRAND_STYLES = {
  legacy: {
    id: 'legacy',
    label: 'Attuale',
    colors: {
      ink: '#0C0C0C',
      white: '#FFFFFF',
      primary: '#196B24',
      primaryDeep: '#0F3F16',
      primaryBright: '#4EA72E',
      accent: '#8ED873',
      accentSurface: '#D9F2D0',
      surface: '#F3FAEF',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#06B6D4',
      chart: {
        1: '#0EA5E9',
        2: '#14B8A6',
        3: '#8B5CF6',
        4: '#F59E0B',
        5: '#F43F5E',
        6: '#6366F1',
      },
    },
  },
  institutional: {
    id: 'institutional',
    label: 'Istituzionale',
    colors: {
      ink: '#333333',
      white: '#FFFFFF',
      primary: '#104C25',
      primaryDeep: '#0B351A',
      primaryBright: '#196B24',
      accent: '#9ACA4F',
      accentSurface: '#E5F2D0',
      surface: '#F7FBF0',
      success: '#196B24',
      warning: '#9ACA4F',
      danger: '#0B351A',
      info: '#4EA72E',
      chart: {
        1: '#104C25',
        2: '#196B24',
        3: '#4EA72E',
        4: '#9ACA4F',
        5: '#E5F2D0',
        6: '#333333',
      },
    },
  },
} as const;

export type BrandStyleId = keyof typeof BRAND_STYLES;

export const BRAND_CONFIGS = {
  'financial-suite': {
    id: 'financial-suite',
    styleId: 'legacy',
    name: 'Financial Suite',
    productName: 'Comparatore Fondi Pensione',
    applicationName: 'Financial Suite',
    shortName: 'Financial',
    tagline: 'Confronta fondi pensione e scegli con piu consapevolezza.',
    websiteUrl: 'https://financialsuite.it',
    logo: {
      horizontal: '/icons/Logo Verticale_trasparente.png',
      pwa192: '/icons/Favicon_sfondo bianco.png',
      pwa512: '/icons/Logo Verticale_sfondo bianco.png',
    },
  },
  'accademia-previdenza': {
    id: 'accademia-previdenza',
    styleId: 'institutional',
    name: 'Accademia Previdenza',
    productName: 'Comparatore Fondi Pensione',
    applicationName: 'Accademia Previdenza',
    shortName: 'AccPrev',
    tagline: 'Confronta fondi pensione e scegli con piu consapevolezza.',
    websiteUrl: 'https://www.accademiaprevidenza.it',
    logo: {
      horizontal: '/brand/logo-accprev.webp',
      pwa192: '/brand/icon-192.png',
      pwa512: '/brand/icon-512.png',
    },
  },
} as const satisfies Record<string, {
  id: string;
  styleId: BrandStyleId;
  name: string;
  productName: string;
  applicationName: string;
  shortName: string;
  tagline: string;
  websiteUrl: string;
  logo: {
    horizontal: string;
    pwa192: string;
    pwa512: string;
  };
}>;

export type BrandId = keyof typeof BRAND_CONFIGS;

export const DEFAULT_BRAND_ID: BrandId = 'accademia-previdenza';
export const DEFAULT_BRAND_STYLE: BrandStyleId = BRAND_CONFIGS[DEFAULT_BRAND_ID].styleId;
export const PROJECT_BRAND_IDS: Record<string, BrandId> = {
  'financial-suite': 'financial-suite',
  'accademia-previdenza': 'accademia-previdenza',
};

export const isBrandStyleId = (value: string | null): value is BrandStyleId => {
  return value === 'legacy' || value === 'institutional';
};

export const isBrandId = (value: string | null | undefined): value is BrandId => {
  return value === 'financial-suite' || value === 'accademia-previdenza';
};

export const resolveBrandId = (projectId?: string): BrandId => {
  if (isBrandId(projectId)) {
    return projectId;
  }

  return projectId ? PROJECT_BRAND_IDS[projectId] ?? DEFAULT_BRAND_ID : DEFAULT_BRAND_ID;
};

const metaEnv = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
export const ACTIVE_BRAND_ID = resolveBrandId(metaEnv.env?.VITE_FIREBASE_PROJECT_ID);

const ACTIVE_BRAND_CONFIG = BRAND_CONFIGS[ACTIVE_BRAND_ID];

export const BRAND_TOKENS = {
  ...ACTIVE_BRAND_CONFIG,
  styles: BRAND_STYLES,
  colors: BRAND_STYLES[ACTIVE_BRAND_CONFIG.styleId].colors,
} as const;

export type BrandTokens = typeof BRAND_TOKENS;
export type BrandColor = keyof BrandTokens['colors'];
