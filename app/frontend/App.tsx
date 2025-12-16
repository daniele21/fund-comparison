import React, { useState, useMemo, useEffect } from 'react';
import { pensionFundsData } from './data/funds';
import { PensionFund, FundCategory, SortConfig, SortableKey } from './types';
import Header from './components/Header';
import Playbook from './components/Playbook';
import LoginModal from './components/LoginModal';
import FilterControls from './components/FilterControls';
import ActiveFiltersChips from './components/ActiveFiltersChips';
import SelectedFundsBar from './components/SelectedFundsBar';
import PerformanceChart from './components/PerformanceChart';
import CostChart from './components/CostChart';
import FundTable from './components/FundTable';
import FundDetailModal from './components/FundDetailModal';
import { CATEGORY_MAP } from './constants';
import { useAuth } from './auth';
import UpgradeDialog from './components/UpgradeDialog';
import FakePaymentDialog from './components/FakePaymentDialog';
import FeedbackWidget from './components/feedback/FeedbackWidget';
import Footer from './components/Footer';
import { GuidedFundComparator } from './components/guided/GuidedFundComparator';
import { GuidedComparatorProvider, useGuidedComparator, MAX_SELECTED_FUNDS } from './components/guided/GuidedComparatorContext';
import PlaybookContent from './components/PlaybookContent';
import TfrFaq from './components/TfrFaq';
import { ToastProvider } from './components/animations/ToastNotifications';
import { PageTransition } from './components/animations/PageTransition';
import { ScrollReveal, ScrollProgress } from './components/animations/ScrollReveal';
import { AnimatedButton } from './components/animations/AnimatedButton';
import { FloatingCompareButton } from './components/animations/FloatingCompareButton';

type View = 'playbook' | 'dashboard';
type DashboardSection = 'playbook' | 'have-fund' | 'choose-fund' | 'learn' | 'tfr-faq';

// Helper function to reliably get the value to sort by from a fund object.
const getSortValue = (fund: PensionFund, key: SortableKey): string | number | null => {
  switch (key) {
    case 'linea':
      return fund.linea;
    case 'categoria':
      return fund.categoria;
    case 'type':
      return fund.type;
    case 'costoAnnuo':
      return fund.costoAnnuo;
    case 'ultimoAnno':
      return fund.rendimenti.ultimoAnno;
    case 'ultimi3Anni':
      return fund.rendimenti.ultimi3Anni;
    case 'ultimi5Anni':
      return fund.rendimenti.ultimi5Anni;
    case 'ultimi10Anni':
      return fund.rendimenti.ultimi10Anni;
    case 'ultimi20Anni':
      return fund.rendimenti.ultimi20Anni;
    default:
      return null;
  }
};

const FREE_PLAN_LIMIT = 10;

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('playbook');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [activeSection, setActiveSection] = useState<DashboardSection>('playbook');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'FPN' | 'FPA' | 'PIP' | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ultimoAnno', direction: 'descending' });
  const [modalFund, setModalFund] = useState<PensionFund | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showFakePayment, setShowFakePayment] = useState(false);
  const { user, loading: authLoading, authMode } = useAuth();
  const { selectedFundIds, toggleSelectedFund, clearSelectedFunds, setEntryMode } = useGuidedComparator();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const currentPlan = user?.plan ?? 'free';
  const isFullAccess = currentPlan === 'full-access';

  // When the user logs out, redirect to the playbook (home) and close any auth
  // related UI that may be open. This ensures the app shows a clear home state
  // after logout instead of leaving the dashboard visible.
  useEffect(() => {
    if (!user) {
      // Close login modal, upgrade/payment dialogs and show the playbook
      setShowLoginModal(false);
      setShowUpgradeDialog(false);
      setShowFakePayment(false);
      setView('playbook');
      setActiveSection('playbook');
    }
  }, [user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Scroll to top when navigating between sections
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleGoToPlaybook = () => {
    setView('playbook');
  };

  // Login modal gating
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingUpgradeAfterLogin, setPendingUpgradeAfterLogin] = useState(false);
  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => {
    setShowLoginModal(false);
    setPendingUpgradeAfterLogin(false);
  };
  const handleUpgradeLogin = () => {
    setShowUpgradeDialog(false);
    setPendingUpgradeAfterLogin(true);
    openLoginModal();
  };

  const handleStartFakePayment = () => {
    setShowUpgradeDialog(false);
    setShowFakePayment(true);
  };

  const { companies, categories } = useMemo(() => {
    const companySet = new Set<string>();
    const categorySet = new Set<FundCategory>();
    pensionFundsData.forEach(fund => {
      if (fund.societa) {
        companySet.add(fund.societa);
      }
      categorySet.add(fund.categoria);
    });
    return {
      companies: Array.from(companySet).sort(),
      categories: Array.from(categorySet).sort((a, b) => CATEGORY_MAP[a].localeCompare(CATEGORY_MAP[b])),
    };
  }, []);
  
  const selectedFundIdsSet = useMemo(() => new Set(selectedFundIds), [selectedFundIds]);

  const sectionCopy = useMemo(() => ({
    'have-fund': {
      title: 'Ho già un fondo pensione',
      description: 'Verifica come sta andando il tuo fondo attuale e confrontalo con le migliori alternative del mercato.',
      eyebrow: 'Check',
    },
    'choose-fund': {
      title: 'Devo scegliere un fondo',
      description: 'Filtra e confronta i fondi per individuare quelli più adatti al tuo profilo e alla tua azienda.',
      eyebrow: 'Decisione',
    },
    learn: {
      title: 'Voglio capire come funzionano',
      description: 'Esplora dati, grafici e dettagli per imparare come operano i fondi e prendere decisioni informate.',
      eyebrow: 'Capire',
    },
    'tfr-faq': {
      title: 'Domande frequenti sul TFR',
      description: 'Risposte rapide tratte dalla guida TFR: basi, scelte azienda/fondo e tassazione.',
      eyebrow: 'FAQ',
    },
    playbook: {
      title: 'Guida',
      description: 'Approfondisci la guida strategica che hai visto in apertura, sempre disponibile nella tua area riservata.',
      eyebrow: 'Guida',
    },
  }), []);

  const navItems: { id: DashboardSection; label: string }[] = [
    { id: 'playbook', label: 'Guida' },
    { id: 'have-fund', label: 'Check' },
    { id: 'choose-fund', label: 'Decisione' },
    { id: 'learn', label: 'Capire' },
    { id: 'tfr-faq', label: 'TFR Info' },
  ];

  const navButtonClasses = (id: DashboardSection) =>
    `group relative w-full text-left rounded-xl transition-all duration-200 ${
      activeSection === id
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 border-transparent'
        : 'bg-slate-50/50 text-slate-700 border border-slate-200/50 hover:bg-white hover:border-slate-300 hover:shadow-md dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700/50 dark:hover:bg-slate-800 dark:hover:border-slate-600'
    } ${
      sidebarCollapsed 
        ? 'flex items-center justify-center p-3' 
        : 'flex items-center gap-3 px-4 py-3'
    }`;

  const filteredFunds = useMemo(() => {
    return pensionFundsData.filter(fund => {
      if (selectedType !== 'all' && fund.type !== selectedType) {
        return false;
      }
      if (selectedCategory !== 'all' && fund.categoria !== selectedCategory) {
        return false;
      }
      if (selectedCompany !== 'all' && fund.societa !== selectedCompany) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const fundText = `${fund.pip} ${fund.linea} ${fund.societa || ''}`.toLowerCase();
        if (!fundText.includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [searchTerm, selectedCategory, selectedCompany, selectedType]);

  const filteredAndSortedFunds = useMemo(() => {
  const { key, direction } = sortConfig;

  const sorted = [...filteredFunds].sort((a, b) => {
    const dir = direction === 'ascending' ? 1 : -1;

    // Special-case: allow sorting by whether a fund is selected
    if (key === 'selected') {
      const aSel = selectedFundIdsSet.has(a.id) ? 1 : 0;
      const bSel = selectedFundIdsSet.has(b.id) ? 1 : 0;
      // put selected first when descending, last when ascending
      return (aSel - bSel) * dir * -1;
    }

    const aVal = getSortValue(a, key);
    const bVal = getSortValue(b, key);

    // Robust null handling: always push nulls to the bottom
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * dir;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * dir;
    }
    return 0;
  });

  return sorted;
}, [filteredFunds, sortConfig, selectedFundIds]);

  const visibleFunds = useMemo(() => {
    // For pagination we will compute a paginated slice later. Here return the full
    // (or limited by free plan) array that pagination will slice from. If the
    // application is running with no authentication (authMode === 'none') we
    // consider it an open demo environment and show the full dataset.
    if (isFullAccess || authMode === 'none') {
      return filteredAndSortedFunds;
    }
    return filteredAndSortedFunds.slice(0, FREE_PLAN_LIMIT);
  }, [filteredAndSortedFunds, isFullAccess, authMode]);

  // Do not show upgrade prompt when the app is running with no authentication
  const showUpgradeNotice = !authLoading && authMode !== 'none' && !isFullAccess && filteredAndSortedFunds.length > FREE_PLAN_LIMIT;

  const fundById = useMemo(() => {
    const map = new Map<string, PensionFund>();
    pensionFundsData.forEach(fund => map.set(fund.id, fund));
    return map;
  }, [pensionFundsData]);

  const selectedFunds = useMemo(() => {
    return selectedFundIds
      .map(fundId => fundById.get(fundId))
      .filter((fund): fund is PensionFund => Boolean(fund));
  }, [selectedFundIds, fundById]);

  const toggleFundSelection = (fundId: string) => {
    if (!selectedFundIdsSet.has(fundId) && selectedFundIds.length >= MAX_SELECTED_FUNDS) {
      return;
    }
    toggleSelectedFund(fundId);
  };
  
  const resetSelection = () => {
    clearSelectedFunds();
  };

  const handleFundClick = (fund: PensionFund) => {
    setModalFund(fund);
  };

  const handleCloseModal = () => {
    setModalFund(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCompany('all');
    setSelectedType('all');
  };

  const handlePresetSelected = (presetId: string) => {
    setPage(1);
    setSearchTerm('');
    switch (presetId) {
      case 'cheapest-35y':
        setSelectedCategory('all');
        setSelectedCompany('all');
        setSelectedType('all');
        setSortConfig({ key: 'costoAnnuo', direction: 'ascending' });
        break;
      case 'best-10y-returns':
        setSortConfig({ key: 'ultimi10Anni', direction: 'descending' });
        break;
      case 'near-retirement':
        setSelectedCategory('GAR');
        setSelectedType('FPN');
        setSortConfig({ key: 'costoAnnuo', direction: 'ascending' });
        break;
      case 'just-starting':
        setSelectedCategory('AZN');
        setSelectedType('PIP');
        setSortConfig({ key: 'ultimi10Anni', direction: 'descending' });
        break;
      default:
        break;
    }
  };

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters or sort change
  useEffect(() => setPage(1), [searchTerm, selectedCategory, selectedCompany, selectedType, sortConfig]);

  // Keep guided flows aligned with sidebar section
  useEffect(() => {
    if (activeSection === 'have-fund') {
      setEntryMode('check-fund');
    } else if (activeSection === 'choose-fund') {
      setEntryMode('choose-fund');
    } else if (activeSection === 'learn') {
      setEntryMode('learn');
    } else {
      setEntryMode(null);
    }
  }, [activeSection, setEntryMode]);

  if (view === 'playbook') {
    return (
      <>
        <Playbook onStart={openLoginModal} theme={theme} toggleTheme={toggleTheme} />
        <LoginModal
          open={showLoginModal}
          onClose={closeLoginModal}
          onSuccess={() => {
            closeLoginModal();
            setActiveSection('playbook');
            setView('dashboard');
          }}
        />
      </>
    );
  }

  return (
    <>
      <ToastProvider />
      <ScrollProgress position="top" height={3} color="bg-gradient-to-r from-sky-600 to-cyan-600" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onGoToPlaybook={handleGoToPlaybook}
          onLoginRequest={openLoginModal}
          onVisibilityChange={setIsHeaderVisible}
          navItems={navItems}
          activeNavId={activeSection}
          onSelectNav={setActiveSection}
          sidebarCollapsed={sidebarCollapsed}
        />
      
      {/* Layout with Sidebar */}
      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">
        {/* Fixed Sidebar Navigation */}
        <aside
          className={`hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 shadow-lg transition-all duration-300 z-10 ${
            sidebarCollapsed ? 'w-20' : 'w-56 lg:w-60'
          }`}
        >
          <nav
            className="h-full flex flex-col"
            aria-label="Navigazione dashboard"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/50">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Menu
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setSidebarCollapsed(prev => !prev)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label={sidebarCollapsed ? 'Espandi menu' : 'Comprimi menu'}
                title={sidebarCollapsed ? 'Espandi menu' : 'Comprimi menu'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform duration-300 ${
                    sidebarCollapsed ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={navButtonClasses(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {/* Icon with active indicator dot */}
                  <span className={`relative flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${sidebarCollapsed ? 'mx-auto' : ''}`}>
                    {index === 0 && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                      </svg>
                    )}
                    {index === 3 && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                      </svg>
                    )}
                    {index === 4 && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008zm0-2.25a.75.75 0 00.75-.75 1.5 1.5 0 10-1.5 1.5.75.75 0 01.75.75zm0-7.5a2.25 2.25 0 00-2.25 2.25.75.75 0 101.5 0 .75.75 0 011.5 0 .75.75 0 001.5 0A2.25 2.25 0 0012 6z" />
                      </svg>
                    )}
                    {/* Active indicator dot for collapsed sidebar */}
                    {activeSection === item.id && sidebarCollapsed && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full ring-2 ring-blue-600 animate-pulse"></span>
                    )}
                  </span>
                  
                  {/* Label */}
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                  )}

                  {/* Active indicator */}
                  {activeSection === item.id && !sidebarCollapsed && (
                    <span className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content with margin for sidebar */}
        <main 
          className={`flex-1 min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'md:ml-20' : 'md:ml-56 lg:ml-60'
          }`}
        >
          <div 
            className="px-6 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-12 space-y-8 sm:space-y-10 max-w-[1800px]"
            style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
          >
            <PageTransition pageKey={activeSection} variant="slideUp">
              {activeSection === 'playbook' ? (
                <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 sm:px-5 sm:py-6 md:px-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500 dark:text-slate-400">{sectionCopy.playbook.eyebrow}</p>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{sectionCopy.playbook.title}</h2>
                      <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl">{sectionCopy.playbook.description}</p>
                    </div>
                  </div>
                  <PlaybookContent onNavigate={(section) => setActiveSection(section)} />
                </section>
              ) : activeSection === 'tfr-faq' ? (
                <div className="space-y-6 sm:space-y-8 md:space-y-10">
                  <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 sm:px-5 sm:py-6 md:px-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500 dark:text-slate-400">{sectionCopy[activeSection].eyebrow}</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{sectionCopy[activeSection].title}</h2>
                        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl">{sectionCopy[activeSection].description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Informazioni TFR
                        </span>
                      </div>
                    </div>
                  </div>
                  <TfrFaq />
                </div>
              ) : (
              <div className="space-y-6 sm:space-y-8 md:space-y-10">
                <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 sm:px-5 sm:py-6 md:px-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500 dark:text-slate-400">{sectionCopy[activeSection].eyebrow}</p>
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{sectionCopy[activeSection].title}</h2>
                      <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl">{sectionCopy[activeSection].description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Visual &amp; tabella
                      </span>
                    </div>
                  </div>
                </div>
                <GuidedFundComparator funds={pensionFundsData} onPresetSelected={handlePresetSelected} onFundClick={handleFundClick} theme={theme}>
                  <div className="space-y-6 sm:space-y-8 md:space-y-10">
                    <ScrollReveal variant="slideUp" duration={0.6} threshold={0.2}>
                      <section id="visual-comparison" className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 sm:px-4 sm:py-5 md:px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 min-w-0 overflow-hidden scroll-mt-20">
                        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Visual Comparison</h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Andamento e costi dei fondi selezionati, sempre aggiornati.</p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <VisualComparison
                            appSelectedFunds={selectedFunds}
                            fundById={fundById}
                            theme={theme}
                          />
                        </div>
                      </section>
                    </ScrollReveal>

                    <div className="space-y-6 min-w-0">
                      <ScrollReveal variant="slideUp" duration={0.6} delay={0.1} threshold={0.2}>
                        <FilterControls
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          categories={categories}
                          selectedCompany={selectedCompany}
                          setSelectedCompany={setSelectedCompany}
                          companies={companies}
                          selectedType={selectedType}
                          setSelectedType={setSelectedType}
                          onReset={resetFilters}
                          totalFunds={pensionFundsData.length}
                        />
                      </ScrollReveal>

                      <ScrollReveal variant="fadeIn" duration={0.5} delay={0.15} threshold={0.2}>
                        <ActiveFiltersChips
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          selectedCompany={selectedCompany}
                          setSelectedCompany={setSelectedCompany}
                          selectedType={selectedType}
                          setSelectedType={setSelectedType}
                          onResetAll={resetFilters}
                        />
                      </ScrollReveal>

                      <ScrollReveal variant="slideUp" duration={0.6} delay={0.2} threshold={0.1}>
                        <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 sm:px-4 sm:py-5 md:px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 min-w-0 overflow-hidden">
                        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Fondi</h2>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {filteredAndSortedFunds.length} {filteredAndSortedFunds.length === 1 ? 'fondo trovato' : 'fondi trovati'} — {selectedFundIds.length} {selectedFundIds.length === 1 ? 'selezionato' : 'selezionati'}
                          </p>
                        </div>
                        {showUpgradeNotice && (
                          <div className="mb-4 sm:mb-5 rounded-lg sm:rounded-xl border border-sky-200 bg-sky-50 p-3 sm:p-4 text-slate-700 shadow-sm dark:border-sky-700/70 dark:bg-slate-800/60 dark:text-slate-200">
                            <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">Piano free attivo</p>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                                  Visualizzi i primi {FREE_PLAN_LIMIT} risultati. Passa al piano full access per esplorare l&apos;elenco completo dei fondi.
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full sm:w-auto">
                                {!user && (
                                  <AnimatedButton
                                    onClick={handleUpgradeLogin}
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                  >
                                    Accedi
                                  </AnimatedButton>
                                )}
                                <AnimatedButton
                                  onClick={() => setShowUpgradeDialog(true)}
                                  variant="primary"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  Scopri full access
                                </AnimatedButton>
                              </div>
                            </div>
                          </div>
                        )}
                        <GuidedFundTable
                          funds={visibleFunds.slice((page - 1) * pageSize, page * pageSize)}
                          sortConfig={sortConfig}
                          setSortConfig={setSortConfig}
                          selectedFundIds={selectedFundIdsSet}
                          toggleFundSelection={toggleFundSelection}
                          onFundClick={handleFundClick}
                        />

                        <div className="mt-4 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="order-2 sm:order-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center sm:text-left">
                            Mostrati {Math.min(visibleFunds.length, page * pageSize) - (page - 1) * pageSize} di {visibleFunds.length}
                          </div>
                          <div className="order-1 sm:order-2 flex flex-wrap items-center gap-2 justify-center sm:justify-end">
                            <label className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Per pagina</label>
                            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="text-xs sm:text-sm px-2 py-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-700">
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                            <AnimatedButton 
                              disabled={page === 1} 
                              onClick={() => setPage(p => Math.max(1, p - 1))} 
                              variant="ghost"
                              size="sm"
                            >
                              Prev
                            </AnimatedButton>
                            <span className="text-xs sm:text-sm font-medium">{page}</span>
                            <AnimatedButton 
                              disabled={page * pageSize >= visibleFunds.length} 
                              onClick={() => setPage(p => p + 1)}
                              variant="ghost"
                              size="sm"
                            >
                              Next
                            </AnimatedButton>
                          </div>
                        </div>
                      </section>
                      </ScrollReveal>
                    </div>
                  </div>
                </GuidedFundComparator>
              </div>
            )}
            </PageTransition>
          </div>
        </main>

        {/* Floating Compare Button */}
        <FloatingCompareButton
          selectedCount={selectedFundIds.length}
          maxCount={10}
          onClick={() => {
            console.log('FloatingCompareButton clicked! Selected:', selectedFundIds.length); // Debug log
            
            // If we're in playbook section, switch to comparison view first
            if (activeSection === 'playbook') {
              setActiveSection('have-fund');
              // Wait for the view to render, then scroll to Visual Comparison
              setTimeout(() => {
                const visualSection = document.getElementById('visual-comparison');
                console.log('Visual section found:', !!visualSection); // Debug
                if (visualSection) {
                  visualSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 400); // Increased timeout to ensure render
            } else {
              // We're already in comparison view, scroll directly to Visual Comparison
              const visualSection = document.getElementById('visual-comparison');
              console.log('Visual section found:', !!visualSection); // Debug
              if (visualSection) {
                visualSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                console.error('Visual comparison section not found!');
              }
            }
          }}
          show={activeSection !== 'playbook' && activeSection !== 'tfr-faq'}
          position="bottom-right"
        />
      </div>
      
      <FundDetailModal fund={modalFund} onClose={handleCloseModal} theme={theme} />
      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        onRequestLogin={handleUpgradeLogin}
        onStartCheckout={handleStartFakePayment}
        isAuthenticated={!!user}
      />
      <FakePaymentDialog
        open={showFakePayment}
        onClose={() => setShowFakePayment(false)}
        onSuccess={() => setShowFakePayment(false)}
      />
      <LoginModal
        open={showLoginModal}
        onClose={closeLoginModal}
        onSuccess={() => {
          const shouldOpenPayment = pendingUpgradeAfterLogin;
          closeLoginModal();
          setShowUpgradeDialog(false);
          setView('dashboard');
          if (shouldOpenPayment) {
            setShowFakePayment(true);
          }
        }}
      />
      <FeedbackWidget onRequireLogin={openLoginModal} />
      <Footer sidebarCollapsed={sidebarCollapsed} hasSidebar={true} />
      </div>
    </>
  );
};

const App: React.FC = () => (
  <GuidedComparatorProvider>
    <AppContent />
  </GuidedComparatorProvider>
);

const GuidedFundTable: React.FC<React.ComponentProps<typeof FundTable>> = ({ onFundClick, ...rest }) => {
  const { setSelectedFundId } = useGuidedComparator();

  const handleFundClick = (fund: PensionFund) => {
    setSelectedFundId(fund.id);
    onFundClick(fund);
  };

  return <FundTable {...rest} onFundClick={handleFundClick} />;
};

// VisualComparison: prefer guided-selected funds when available.
const VisualComparison: React.FC<{
  appSelectedFunds: PensionFund[];
  fundById: Map<string, PensionFund>;
  theme: string;
}> = ({ appSelectedFunds, fundById, theme }) => {
  const { selectedFundIds } = useGuidedComparator();

  const guidedSelected = React.useMemo(() => {
    if (!selectedFundIds || selectedFundIds.length === 0) return null;
    return selectedFundIds.map(id => fundById.get(id)).filter((f): f is PensionFund => !!f);
  }, [selectedFundIds, fundById]);

  const fundsToShow = guidedSelected && guidedSelected.length > 0 ? guidedSelected : appSelectedFunds;
  const { toggleSelectedFund, clearSelectedFunds } = useGuidedComparator();

  return (
    <div>
      {/* Place SelectedFundsBar here so it appears above the charts (inside VisualComparison)") */}
      <SelectedFundsBar
        selectedFunds={fundsToShow}
        selectedFundIds={selectedFundIds}
        onToggleFund={(id: string) => toggleSelectedFund(id)}
        onClearAll={() => clearSelectedFunds()}
        isHeaderVisible={false}
        maxFunds={MAX_SELECTED_FUNDS}
      />

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
          <PerformanceChart selectedFunds={fundsToShow} theme={theme} />
        </div>
        <div className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
          <CostChart selectedFunds={fundsToShow} theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default App;
