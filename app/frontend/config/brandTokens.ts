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
      primary: '#0B196F',
      primaryDeep: '#071156',
      primaryBright: '#122385',
      accent: '#5D8BF4',
      accentSurface: '#D1D4EA',
      surface: '#F7F8FD',
      success: '#122385',
      warning: '#5D8BF4',
      danger: '#071156',
      info: '#5D8BF4',
      chart: {
        1: '#0B196F',
        2: '#122385',
        3: '#5D8BF4',
        4: '#071156',
        5: '#D1D4EA',
        6: '#333333',
      },
    },
  },
} as const;

export type BrandStyleId = keyof typeof BRAND_STYLES;

export const DEFAULT_BRAND_STYLE: BrandStyleId = 'legacy';
export const FIREBASE_PROJECT_BRAND_STYLES: Record<string, BrandStyleId> = {
  'financial-suite': 'legacy',
  'accademia-previdenza': 'institutional',
};

export const isBrandStyleId = (value: string | null): value is BrandStyleId => {
  return value === 'legacy' || value === 'institutional';
};

export const resolveBrandStyleForFirebaseProject = (projectId?: string): BrandStyleId => {
  if (!projectId) {
    return DEFAULT_BRAND_STYLE;
  }

  return FIREBASE_PROJECT_BRAND_STYLES[projectId] ?? DEFAULT_BRAND_STYLE;
};

export const BRAND_TOKENS = {
  name: 'Accademia Previdenza',
  productName: 'Comparatore Fondi Pensione',
  applicationName: 'Accademia Previdenza',
  shortName: 'AccPrev',
  tagline: 'Confronta fondi pensione e scegli con piu consapevolezza.',
  logo: {
    horizontal: '/brand/logo-accprev.webp',
    pwa192: '/brand/icon-192.png',
    pwa512: '/brand/icon-512.png',
  },
  styles: BRAND_STYLES,
  colors: BRAND_STYLES[DEFAULT_BRAND_STYLE].colors,
} as const;

export type BrandTokens = typeof BRAND_TOKENS;
export type BrandColor = keyof BrandTokens['colors'];
