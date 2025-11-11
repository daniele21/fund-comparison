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
import { GuidedFundComparator } from './components/guided/GuidedFundComparator';
import { GuidedComparatorProvider, useGuidedComparator, MAX_SELECTED_FUNDS } from './components/guided/GuidedComparatorContext';

type View = 'playbook' | 'dashboard';

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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'FPN' | 'FPA' | 'PIP' | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ultimoAnno', direction: 'descending' });
  const [modalFund, setModalFund] = useState<PensionFund | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showFakePayment, setShowFakePayment] = useState(false);
  const { user, loading: authLoading, authMode } = useAuth();
  const { selectedFundIds, toggleSelectedFund, clearSelectedFunds } = useGuidedComparator();
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

  if (view === 'playbook') {
    return (
      <>
        <Playbook onStart={openLoginModal} theme={theme} toggleTheme={toggleTheme} />
        <LoginModal
          open={showLoginModal}
          onClose={closeLoginModal}
          onSuccess={() => {
            closeLoginModal();
            setView('dashboard');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onGoToPlaybook={handleGoToPlaybook}
        onLoginRequest={openLoginModal}
        onVisibilityChange={setIsHeaderVisible}
      />
      {/* Selected funds bar shown directly under the header for quick access */}
      <SelectedFundsBar
        selectedFunds={selectedFunds}
        selectedFundIds={selectedFundIds}
        onToggleFund={toggleFundSelection}
        onClearAll={resetSelection}
        isHeaderVisible={isHeaderVisible}
        maxFunds={MAX_SELECTED_FUNDS}
      />
      <main className="px-3 pb-16 pt-6 sm:px-4 sm:pb-20 sm:pt-20 md:px-6 md:pt-24 lg:px-8 overflow-x-hidden">
        <div className="mx-auto w-full max-w-full lg:max-w-7xl min-w-0">
          <GuidedFundComparator funds={pensionFundsData} onPresetSelected={handlePresetSelected}>
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/90 px-3 py-4 sm:px-4 sm:py-5 md:px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 min-w-0 overflow-hidden">
                <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Visual Comparison</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Andamento e costi dei fondi selezionati, sempre aggiornati.</p>
                  </div>
                </div>

                <div className="mt-5">
                  {/* VisualComparison chooses guided-selected funds when available, otherwise falls back to app selection */}
                  <VisualComparison
                    appSelectedFunds={selectedFunds}
                    fundById={fundById}
                    theme={theme}
                  />
                </div>
              </section>

              <div className="space-y-6 min-w-0">
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
                            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">Piano Free attivo</p>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                              Visualizzi i primi {FREE_PLAN_LIMIT} risultati. Passa al piano Full Access per esplorare l&apos;elenco completo dei fondi.
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full sm:w-auto">
                            {!user && (
                              <button
                                onClick={handleUpgradeLogin}
                                className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                              >
                                Accedi
                              </button>
                            )}
                            <button
                              onClick={() => setShowUpgradeDialog(true)}
                              className="w-full sm:w-auto rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                            >
                              Scopri Full Access
                            </button>
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
                        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-slate-800 border dark:border-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
                        <span className="text-xs sm:text-sm font-medium">{page}</span>
                        <button disabled={page * pageSize >= visibleFunds.length} onClick={() => setPage(p => p + 1)} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-slate-800 border dark:border-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                      </div>
                    </div>
                </section>
              </div>
            </div>
          </GuidedFundComparator>
        </div>
      </main>
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
          if (shouldOpenPayment) {
            setShowFakePayment(true);
          }
        }}
      />
      <FeedbackWidget onRequireLogin={openLoginModal} />
    </div>
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

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      <div className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
        <PerformanceChart selectedFunds={fundsToShow} theme={theme} />
      </div>
      <div className="min-w-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
        <CostChart selectedFunds={fundsToShow} theme={theme} />
      </div>
    </div>
  );
};

export default App;
