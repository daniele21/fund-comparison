import React, { useState, useMemo, useEffect } from 'react';
import { pensionFundsData } from './data/funds';
import { PensionFund, FundCategory, SortConfig, SortableKey } from './types';
import Header from './components/Header';
import Playbook from './components/Playbook';
import LoginModal from './components/LoginModal';
import FilterControls from './components/FilterControls';
import PerformanceChart from './components/PerformanceChart';
import CostChart from './components/CostChart';
import FundTable from './components/FundTable';
import FundDetailModal from './components/FundDetailModal';
import { CATEGORY_MAP } from './constants';
import { useAuth } from './auth';
import UpgradeDialog from './components/UpgradeDialog';
import FakePaymentDialog from './components/FakePaymentDialog';

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

const App: React.FC = () => {
  const [view, setView] = useState<View>('playbook');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FundCategory | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'FPN' | 'FPA' | 'PIP' | 'all'>('all');
  const [selectedFundIds, setSelectedFundIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'ultimoAnno', direction: 'descending' });
  const [modalFund, setModalFund] = useState<PensionFund | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showFakePayment, setShowFakePayment] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const currentPlan = user?.plan ?? 'free';
  const isFullAccess = currentPlan === 'full-access';

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
        const aVal = getSortValue(a, key);
        const bVal = getSortValue(b, key);
        const dir = direction === 'ascending' ? 1 : -1;

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
}, [filteredFunds, sortConfig]);

  const visibleFunds = useMemo(() => {
    if (isFullAccess) {
      return filteredAndSortedFunds;
    }
    return filteredAndSortedFunds.slice(0, FREE_PLAN_LIMIT);
  }, [filteredAndSortedFunds, isFullAccess]);

  const showUpgradeNotice = !authLoading && !isFullAccess && filteredAndSortedFunds.length > FREE_PLAN_LIMIT;

  const selectedFunds = useMemo(() => {
    return pensionFundsData.filter(fund => selectedFundIds.has(fund.id));
  }, [selectedFundIds]);

  const toggleFundSelection = (fundId: string) => {
    setSelectedFundIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fundId)) {
        newSet.delete(fundId);
      } else {
        if (newSet.size >= 10) {
            return prev;
        }
        newSet.add(fundId);
      }
      return newSet;
    });
  };
  
  const resetSelection = () => {
    setSelectedFundIds(new Set());
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
      <Header theme={theme} toggleTheme={toggleTheme} onGoToPlaybook={handleGoToPlaybook} />
      <main className="container mx-auto p-4 sm:p-5 md:p-8">
        <div className="space-y-12">
          
          <section>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Visual Comparison</h2>
              {selectedFunds.length > 0 && (
                <button
                  onClick={resetSelection}
                  className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200 flex items-center space-x-2"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Resetta Selezione</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PerformanceChart selectedFunds={selectedFunds} theme={theme} />
              <CostChart selectedFunds={selectedFunds} theme={theme} />
            </div>
          </section>

          <div className="space-y-8">
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
            />
            
            <section>
                <div className="flex justify-between items-baseline mb-5">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Risultati</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Mostrando {visibleFunds.length} di {filteredAndSortedFunds.length} fondi
                    </p>
                </div>
                {showUpgradeNotice && (
                  <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-slate-700 shadow-sm dark:border-sky-700/70 dark:bg-slate-800/60 dark:text-slate-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Piano Free attivo</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Visualizzi i primi {FREE_PLAN_LIMIT} risultati. Passa al piano Full Access per esplorare l&apos;elenco completo dei fondi.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {!user && (
                          <button
                            onClick={handleUpgradeLogin}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Accedi
                          </button>
                        )}
                        <button
                          onClick={() => setShowUpgradeDialog(true)}
                          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                        >
                          Scopri Full Access
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <FundTable
                  funds={visibleFunds}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  selectedFundIds={selectedFundIds}
                  toggleFundSelection={toggleFundSelection}
                  onFundClick={handleFundClick}
                />
            </section>
          </div>
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
    </div>
  );
};

export default App;
