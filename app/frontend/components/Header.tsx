import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth';

interface HeaderProps {
        theme: string;
        toggleTheme: () => void;
        onGoToPlaybook?: () => void;
        onLoginRequest?: () => void;
        onVisibilityChange?: (visible: boolean) => void;
        navItems?: { id: string; label: string }[];
        activeNavId?: string;
        onSelectNav?: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onGoToPlaybook, onLoginRequest, onVisibilityChange, navItems, activeNavId, onSelectNav }) => {
    const { user, loading, login, logout, authMode } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        const checkAndUpdateVisibility = () => {
            const isMobile = window.innerWidth < 768;
            
            // Always show header on desktop
            if (!isMobile) {
                setIsHeaderVisible(true);
                return true;
            }
            return false;
        };

        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    // Skip scroll logic on desktop
                    if (checkAndUpdateVisibility()) {
                        ticking.current = false;
                        return;
                    }
                    
                    // Mobile scroll behavior
                    const currentScrollY = window.scrollY;
                    
                    // Show header when scrolling up or at top
                    if (currentScrollY < lastScrollY.current || currentScrollY < 10) {
                        setIsHeaderVisible(true);
                    } 
                    // Hide header when scrolling down and past threshold (mobile only)
                    else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
                        setIsHeaderVisible(false);
                    }
                    
                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        const handleResize = () => {
            checkAndUpdateVisibility();
        };

        // Initial check
        checkAndUpdateVisibility();

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        onVisibilityChange?.(isHeaderVisible);
    }, [isHeaderVisible, onVisibilityChange]);

    const handleLogin = async () => {
        if (authMode !== 'google') {
            if (onLoginRequest) {
                onLoginRequest();
            }
            setMobileMenuOpen(false);
            return;
        }
        await login();
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
    };

    const navActions = (
        <>
            <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-200"
            >
                {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </button>

            {!loading && !user && (
                <button
                    onClick={handleLogin}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-200"
                >
                    Accedi
                </button>
            )}

      {!loading && user && (
                <div className="flex items-center gap-2">
          {/* Avatar/logo intentionally removed per request - keep username and logout only */}
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {authMode === 'google' ? (user.name ?? user.email) : ''}
            </span>
          </div>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 bg-rose-500 text-white text-sm font-semibold rounded-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 w-full sm:w-auto transition-colors"
                    >
                        Esci
                    </button>
                </div>
            )}
        </>
    );

  return (
    <header className={`bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 fixed top-0 left-0 right-0 z-20 backdrop-blur-md transition-all duration-300 shadow-sm ${
      isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="w-full px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        {/* Left side: Logo and Title */}
        <div className="flex items-center gap-3">
          <img src="/icons/Favicon_sfondo%20bianco.png" alt="Logo" className="h-9 w-9 sm:h-12 sm:w-12 object-contain" />
          <div className="leading-tight">
            <span className="text-lg sm:text-xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight block">
              Comparatore Fondi Pensione
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block sm:hidden">
              Confronta e scegli il fondo migliore per te
            </span>
          </div>
        </div>

        {/* Right side: Action buttons */}
        <div className="hidden md:flex items-center gap-3">
          {navActions}
        </div>

        {/* Mobile buttons */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Apri menu"
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <button
            aria-label="Chiudi menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="absolute top-3 right-3 left-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Menu</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Azioni rapide</p>
              </div>
              <button
                aria-label="Chiudi menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">{navActions}</div>

            {navItems && navItems.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">Navigazione</p>
                <div className="flex flex-col gap-2">
                  {navItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectNav?.(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold text-left transition-all duration-200 ${
                        activeNavId === item.id
                          ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900 border-transparent'
                          : 'bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && user && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                    {/* Avatar/logo removed in mobile menu as well */}
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{authMode === 'google' ? (user.name ?? user.email) : ''}</p>
                    </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
