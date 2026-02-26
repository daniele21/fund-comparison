import { DashboardSection, View } from './types';

const SECTION_TO_PATH: Record<DashboardSection, string> = {
  home: '/home',
  simulator: '/simulator',
  'have-fund': '/analyze',
  'choose-fund': '/compare',
  playbook: '/guide',
  'tfr-faq': '/tfr-faq',
  admin: '/admin',
};

const PATH_TO_SECTION: Record<string, DashboardSection> = {
  '/home': 'home',
  '/simulator': 'simulator',
  '/analyze': 'have-fund',
  '/compare': 'choose-fund',
  '/guide': 'playbook',
  '/tfr-faq': 'tfr-faq',
  '/admin': 'admin',
  '/dashboard': 'home',
};

export interface ResolvedRoute {
  view: View;
  section: DashboardSection;
}

export const sectionToPath = (section: DashboardSection): string => {
  return SECTION_TO_PATH[section] ?? '/home';
};

export const resolveRouteFromPathname = (pathname: string): ResolvedRoute => {
  const normalized = pathname.toLowerCase();

  if (normalized === '/' || normalized === '/playbook') {
    return { view: 'playbook', section: 'home' };
  }

  const section = PATH_TO_SECTION[normalized];
  if (!section) {
    return { view: 'dashboard', section: 'home' };
  }

  return { view: 'dashboard', section };
};
