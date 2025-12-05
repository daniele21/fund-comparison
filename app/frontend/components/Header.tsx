import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth';
import { AnimatedButton } from './animations/AnimatedButton';

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
                <AnimatedButton
                    onClick={handleLogin}
                    variant="primary"
                    size="md"
                >
                    Accedi
                </AnimatedButton>
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
      <div className="w-full px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-2">
        {/* Left side: Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <img src="/icons/Favicon_sfondo%20bianco.png" alt="Logo" className="h-8 w-8 sm:h-12 sm:w-12 object-contain flex-shrink-0" />
          <div className="leading-tight min-w-0">
            <span className="text-sm sm:text-xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight block whitespace-nowrap overflow-hidden text-ellipsis">
              Comparatore Fondi Pensione
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block sm:hidden whitespace-nowrap overflow-hidden text-ellipsis">
              Il fondo migliore per te
            </span>
          </div>
        </div>

        {/* Right side: Action buttons */}
        <div className="hidden md:flex items-center gap-3">
          {navActions}
        </div>

        {/* Mobile buttons */}
        <div className="md:hidden flex items-center gap-1 flex-shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Apri menu"
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="absolute top-3 right-3 left-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Menu</span>
              <button
                aria-label="Chiudi menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              {/* Navigation items if present */}
              {navItems && navItems.length > 0 && (
                <div className="space-y-1 mb-3">
                  {navItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectNav?.(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-all duration-200 ${
                        activeNavId === item.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Icons matching desktop sidebar */}
                      {index === 0 && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      )}
                      {index === 1 && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                      )}
                      {index === 2 && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                        </svg>
                      )}
                      {index === 3 && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                        </svg>
                      )}
                      <span className="flex-1">{item.label}</span>
                      {/* Active indicator checkmark */}
                      {activeNavId === item.id && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* User section */}
              {!loading && user && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm">Esci</span>
                  </button>
                </div>
              )}

              {/* Login button */}
              {!loading && !user && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                  <AnimatedButton
                    onClick={handleLogin}
                    variant="primary"
                    size="md"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    }
                    iconPosition="left"
                    className="w-full"
                  >
                    Accedi
                  </AnimatedButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
