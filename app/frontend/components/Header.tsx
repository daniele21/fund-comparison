import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth';
import { AnimatedButton } from './animations/AnimatedButton';
import { BRAND_TOKENS } from '../config/brandTokens';

interface NavSubItem {
  id: string;
  label: string;
  description?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  subItems?: NavSubItem[];
}

interface HeaderProps {
        theme: string;
        toggleTheme: () => void;
        onGoToPlaybook?: () => void;
        onLoginRequest?: () => void;
        onVisibilityChange?: (visible: boolean) => void;
        navItems?: NavItem[];
        activeNavId?: string;
        onSelectNav?: (id: string) => void;
        sidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onGoToPlaybook, onLoginRequest, onVisibilityChange, navItems, activeNavId, onSelectNav }) => {
    const { user, loading, login, logout, authMode } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
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
          {/* Admin badge */}
          {user.isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              👑 Admin
            </span>
          )}
          
          {/* Plan badge - only show for non-admin users */}
          {!user.isAdmin && user.plan && (
            <span className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              user.plan === 'full-access' && user.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : user.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {user.plan === 'full-access' && user.status === 'active' ? (
                <>✓ Full Access</>
              ) : user.status === 'pending' ? (
                <>⏳ In Attesa</>
              ) : (
                <>Free</>
              )}
            </span>
          )}
          
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
      <div className="w-full px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-2 transition-all duration-300">
        {/* Left side: Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <img src={BRAND_TOKENS.logo.horizontal} alt={BRAND_TOKENS.name} className="h-8 w-auto max-w-[132px] sm:h-12 sm:max-w-[220px] object-contain flex-shrink-0" />
          <div className="leading-tight min-w-0">
            <span className="text-sm sm:text-xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight block whitespace-nowrap overflow-hidden text-ellipsis">
              {BRAND_TOKENS.productName}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block sm:hidden whitespace-nowrap overflow-hidden text-ellipsis">
              {BRAND_TOKENS.shortName}
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
                  {navItems.map((item) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedMobileItem === item.id;
                    const isParentActive = hasSubItems && item.subItems?.some(sub => sub.id === activeNavId);
                    
                    return (
                      <div key={item.id}>
                        {/* Main Nav Button */}
                        <button
                          onClick={() => {
                            if (hasSubItems) {
                              setExpandedMobileItem(isExpanded ? null : item.id);
                            } else {
                              onSelectNav?.(item.id);
                              setMobileMenuOpen(false);
                            }
                          }}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-all duration-200 ${
                            activeNavId === item.id || isParentActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                          }`}
                        >
                          {/* Icon */}
                          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                          
                          <span className="flex-1">{item.label}</span>
                          
                          {/* Dropdown indicator or active checkmark */}
                          {hasSubItems ? (
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : (
                            activeNavId === item.id && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )
                          )}
                        </button>

                        {/* Sub-items */}
                        {hasSubItems && isExpanded && (
                          <div className="mt-1 ml-4 pl-3 space-y-1 border-l-2 border-slate-200 dark:border-slate-700">
                            {item.subItems?.map((subItem) => (
                              <button
                                key={subItem.id}
                                onClick={() => {
                                  onSelectNav?.(subItem.id);
                                  setMobileMenuOpen(false);
                                  setExpandedMobileItem(null);
                                }}
                                className={`w-full flex items-start gap-2 rounded-lg px-3 py-2 text-sm text-left transition-all duration-200 ${
                                  activeNavId === subItem.id
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{subItem.label}</div>
                                  {subItem.description && (
                                    <div className="text-xs opacity-70 mt-0.5">{subItem.description}</div>
                                  )}
                                </div>
                                {activeNavId === subItem.id && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
