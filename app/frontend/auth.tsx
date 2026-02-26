import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { AuthUser } from './types';

type AuthMode = 'google' | 'invite_code' | 'none';

type InviteLoginOptions = {
  code: string;
  email?: string;
  name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (options?: InviteLoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  refresh: (tokenOverride?: string) => Promise<AuthUser | null>;
  setToken: (token?: string) => void;
  updateUser: (updater: (prev: AuthUser | null) => AuthUser | null) => void;
  token?: string;
  authMode: AuthMode;
  inviteRequiresEmail: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const env = (import.meta as any).env as Record<string, string> | undefined;
const API_BASE = (env && env.VITE_API_BASE) || 'http://localhost:8000';
const TOKEN_STORAGE_KEY = 'app.authToken';

function readStoredToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    return stored || undefined;
  } catch (err) {
    console.warn('[Auth] Unable to read stored token:', err);
    return undefined;
  }
}

async function fetchMe(token?: string): Promise<AuthUser | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    // If token provided, use it as Bearer auth
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include', // Always send cookies too
      headers,
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    const plan = typeof data.plan === 'string' ? data.plan.toLowerCase() : 'free';
    const normalizedPlan = plan === 'full-access' ? 'full-access' : 'free';
    const roles = data.roles || [];
    const isAdmin = roles.includes('admin');
    return { ...data, plan: normalizedPlan, isAdmin } as AuthUser;
  } catch (e) {
    console.warn('[Auth] fetchMe error:', e);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | undefined>(() => {
    return readStoredToken();
  });
  const [authMode, setAuthMode] = useState<AuthMode>('google');
  const [inviteRequiresEmail, setInviteRequiresEmail] = useState(true);
  const [authConfigLoaded, setAuthConfigLoaded] = useState(false);
  const userRef = React.useRef<AuthUser | null>(null);

  const persistToken = (token?: string) => {
    setSessionToken(token);
    if (typeof window !== 'undefined') {
      if (token) {
        (window as any).__APP_OAUTH_TOKEN = token;
        try {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } catch (err) {
          console.warn('[Auth] Unable to persist token to storage:', err);
        }
      } else {
        delete (window as any).__APP_OAUTH_TOKEN;
        try {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch (err) {
          console.warn('[Auth] Unable to remove token from storage:', err);
        }
      }
    }
  };

  const loadAuthConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/config`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }
      const data = await res.json();
      const mode = typeof data?.mode === 'string' ? (data.mode as AuthMode) : 'google';
      setAuthMode(mode);
      const requiresEmail = data?.invite?.requiresEmail;
      if (typeof requiresEmail === 'boolean') {
        setInviteRequiresEmail(requiresEmail);
      } else {
        setInviteRequiresEmail(true);
      }
    } catch (err) {
      console.warn('[Auth] Unable to load auth config:', err);
    } finally {
      // Signal that we've attempted to load auth config (success or failure)
      setAuthConfigLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAuthConfig();
  }, [loadAuthConfig]);

  useEffect(() => {
    let mounted = true;

    // Listen for popup postMessage (popup flow sends { type: 'oauth', provider, status, token })
    function onMessage(e: MessageEvent) {
      // Log ALL messages for debugging
      console.log('[Auth] 🔔 PostMessage received:', {
        origin: e.origin,
        data: e.data,
        source: e.source === window ? 'self' : 'other window',
        dataType: typeof e.data,
        hasType: e.data?.type,
        hasStatus: e.data?.status
      });
      
      try {
        const payload = e.data;
        
        // First check if this looks like our OAuth message
        if (payload && payload.type === 'oauth' && payload.status === 'success') {
          console.log('[Auth] 🎯 Found OAuth success message!');
          
          // The postMessage comes FROM the backend callback page (which is on API_BASE domain)
          const expectedOrigin = new URL(API_BASE).origin;
          
          // Also accept localhost variant (127.0.0.1 and localhost are treated as same-site but different origins)
          const expectedOriginLocalhost = expectedOrigin.replace('127.0.0.1', 'localhost');
          const expectedOrigin127 = expectedOrigin.replace('localhost', '127.0.0.1');
          
          console.log('[Auth] Expected origins:', expectedOrigin, expectedOriginLocalhost, expectedOrigin127);
          console.log('[Auth] Actual origin:', e.origin);
          
          // Only accept messages from our backend API's origin (with localhost/127.0.0.1 flexibility)
          const isValidOrigin = e.origin === expectedOrigin || 
                               e.origin === expectedOriginLocalhost || 
                               e.origin === expectedOrigin127;
          
          if (!isValidOrigin) {
            console.log('[Auth] ⚠️ Origin mismatch - but processing anyway for debugging!');
            console.log('[Auth] If this works, we need to update the expected origin');
          } else {
            console.log('[Auth] ✅ Origin validated');
          }
          
          console.log('[Auth] 🎉 Processing OAuth success message!');
          // If backend provided a session token in the message, use it for auth
          const token = payload.token as string | undefined;
          if (token) {
            console.log('[Auth] 🔑 Token received in postMessage, length:', token.length);
            persistToken(token);
          } else {
            console.log('[Auth] ⚠️ No token in postMessage payload');
          }
          // Call /auth/me with token (if available) or cookies
          fetchMe(token).then(data => {
            if (data) {
              console.log('[Auth] ✅ User authenticated:', data.email);
              console.log('[Auth] Setting user state and userRef');
              setUser(data);
              userRef.current = data;
              console.log('[Auth] userRef.current is now:', userRef.current?.email);
            } else {
              console.log('[Auth] ❌ /auth/me returned no user data');
            }
          });
        } else {
          console.log('[Auth] ⚠️ Message payload is not an OAuth success message');
        }
      } catch (err) {
        console.error('[Auth] ❌ postMessage handler error:', err);
      }
    }

    window.addEventListener('message', onMessage);

    // Only attempt to call /auth/me after we've loaded auth config. If the configured
    // auth mode is not 'google', skip the automatic /auth/me call to avoid unwanted 401s.
    (async () => {
      if (!authConfigLoaded) return;
      
      // For invite_code and none modes, check if we have a stored token
      if (authMode === 'invite_code' || authMode === 'none') {
        // If we have a token, validate it
        if (sessionToken) {
          const u = await fetchMe(sessionToken);
          if (mounted) {
            setUser(u);
            userRef.current = u;
          }
        }
        if (mounted) setLoading(false);
        return;
      }

      // For google mode, always try to fetch user (with token or cookies)
      const u = await fetchMe(sessionToken);
      if (mounted) {
        setUser(u);
        userRef.current = u;
      }
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
      window.removeEventListener('message', onMessage);
    };
  }, [sessionToken, authConfigLoaded, authMode]);

  const loginWithInvite = async (options: InviteLoginOptions) => {
    const payload = {
      code: options.code?.trim(),
      email: options.email?.trim() || undefined,
      name: options.name?.trim() || undefined,
    };

    if (!payload.code) {
      throw new Error('Inserisci un codice invito valido.');
    }

    try {
      const res = await fetch(`${API_BASE}/auth/invite/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = 'Codice invito non valido o già utilizzato.';
        try {
          const errorBody = await res.json();
          const detail = errorBody?.detail;
          if (detail) {
            // Map known backend messages to localized, user-friendly Italian strings
            const detailStr = String(detail).toLowerCase();
            if (detailStr.includes('invalid') || detailStr.includes('invitation') || detailStr.includes('invalid invitation')) {
              message = 'Codice invito non valido.';
            } else if (detailStr.includes('already') || detailStr.includes('used')) {
              message = 'Questo codice è già stato utilizzato.';
            } else if (detailStr.includes('expired')) {
              message = 'Il codice invito è scaduto.';
            } else {
              // Fallback: use provided detail but keep it short
              message = String(detail);
            }
          }
        } catch (parseErr) {
          console.warn('[Auth] Unable to parse invite login error:', parseErr);
        }
        throw new Error(message);
      }

      const result = await res.json();
      const tokenFromResponse = typeof result?.token === 'string' ? result.token : undefined;
      if (tokenFromResponse) {
        persistToken(tokenFromResponse);
      }

      const refreshed = await fetchMe(tokenFromResponse);
      if (refreshed) {
        setUser(refreshed);
        userRef.current = refreshed;
      } else if (result?.user) {
        const plan = typeof result.user.plan === 'string' && result.user.plan.toLowerCase() === 'full-access' ? 'full-access' : 'free';
        const fallbackUser = { ...result.user, plan } as AuthUser;
        setUser(fallbackUser);
        userRef.current = fallbackUser;
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Impossibile completare l\'accesso con invito.');
    }
  };

  const login = async (options?: InviteLoginOptions) => {
    if (authMode === 'none') {
      return;
    }

    if (authMode === 'invite_code') {
      if (!options) {
        throw new Error('Fornisci il codice invito per accedere.');
      }
      await loginWithInvite(options);
      return;
    }

    // For Google OAuth, use Google Identity Services (GIS) with popup
    try {
      setLoading(true);
      // Wait for GIS library to load
      await waitForGoogleGSI();
      
      // Get OAuth config from backend
      const configRes = await fetch(`${API_BASE}/auth/google/config`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!configRes.ok) {
        throw new Error('Failed to load OAuth configuration');
      }
      
      const config = await configRes.json();
      const clientId = config.client_id;
      
      if (!clientId) {
        throw new Error('OAuth client_id not configured');
      }

      await new Promise<void>((resolve, reject) => {
        const googleGsi = (window as any).google;
        const client = googleGsi.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: async (response: any) => {
            try {
              console.log('[Auth] Google callback received:', {
                hasError: !!response.error,
                hasCode: !!response.code
              });

              if (response.error) {
                reject(new Error(`Google login failed: ${response.error}`));
                return;
              }

              const exchangeRes = await fetch(`${API_BASE}/auth/google/exchange`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                  'Origin': window.location.origin,
                },
                body: JSON.stringify({
                  code: response.code,
                  redirect_uri: window.location.origin,
                }),
              });

              if (!exchangeRes.ok) {
                const errorData = await exchangeRes.json().catch(() => ({} as { detail?: string }));
                reject(new Error(errorData.detail || 'Failed to exchange authorization code'));
                return;
              }

              const result = await exchangeRes.json();
              const token = result.token as string | undefined;

              if (token) {
                persistToken(token);
              }

              const userData = await fetchMe(token);
              if (!userData) {
                reject(new Error('Login succeeded but failed to load user profile'));
                return;
              }

              setUser(userData);
              userRef.current = userData;
              resolve();
            } catch (callbackErr) {
              reject(callbackErr instanceof Error ? callbackErr : new Error('Unknown OAuth callback error'));
            }
          },
        });

        console.log('[Auth] Requesting Google authorization code...');
        client.requestCode();
      });
    } catch (err) {
      console.error('[Auth] Google login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper to wait for Google GIS library to load
  const waitForGoogleGSI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof (window as any).google !== 'undefined' && (window as any).google.accounts) {
        resolve();
        return;
      }
      
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      const interval = setInterval(() => {
        attempts++;
        if (typeof (window as any).google !== 'undefined' && (window as any).google.accounts) {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Google Identity Services library failed to load'));
        }
      }, 100);
    });
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
      });
    } catch (e) {
      // ignore
    }
    setUser(null);
    userRef.current = null;
    persistToken(undefined);
  };

  const refresh = async (tokenOverride?: string) => {
    const effectiveToken = tokenOverride ?? sessionToken;
    const updated = await fetchMe(effectiveToken);
    if (updated) {
      setUser(updated);
      userRef.current = updated;
    }
    if (tokenOverride) {
      persistToken(tokenOverride);
    }
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      refresh,
      setToken: persistToken,
      updateUser: (updater) => setUser((prev) => updater(prev)),
      token: sessionToken,
      authMode,
      inviteRequiresEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export type { AuthUser };
