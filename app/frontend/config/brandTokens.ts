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
  colors: {
    ink: '#0C0C0C',
    white: '#FFFFFF',
    primary: '#196B24',
    primarySoft: '#8ED873',
    primaryMuted: '#B3E5A1',
    primarySurface: '#D9F2D0',
    accent: '#4EA72E',
  },
} as const;

export type BrandTokens = typeof BRAND_TOKENS;
