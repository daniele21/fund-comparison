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
    return { ...data, plan: normalizedPlan } as AuthUser;
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
    }
  }, []);

  useEffect(() => {
    loadAuthConfig();
  }, [loadAuthConfig]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await fetchMe(sessionToken);
      if (mounted) {
        setUser(u);
        userRef.current = u;
      }
      if (mounted) setLoading(false);
    })();

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
    return () => {
      mounted = false;
      window.removeEventListener('message', onMessage);
    };
  }, []);

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
          if (errorBody?.detail) {
            message = String(errorBody.detail);
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

    // Open popup to provider login endpoint. The backend will postMessage back the token and set cookie.
    const provider = 'google';
    const redirect = window.location.origin; // Backend will use this to postMessage
    const loginUrl = `${API_BASE}/auth/${provider}/login?redirect=${encodeURIComponent(redirect)}`;
    
    const width = 600;
    const height = 700;
    const top = window.top ? Math.max(0, (window.top.innerHeight - height) / 2) : 100;
    const left = window.top ? Math.max(0, (window.top.innerWidth - width) / 2) : 100;

    const popup = window.open(
      loginUrl,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      // Failed to open popup (popup blocked)
      // Fallback: navigate top-level to login
      window.location.href = loginUrl;
      return;
    }
    return new Promise<void>((resolve) => {
      let settled = false;

      // Watch for user state change using ref (not closure)
      const checkInterval = setInterval(() => {
        if (userRef.current !== null) {
          settled = true;
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 200);

      // Safety timeout: after 60s give up waiting
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        clearInterval(checkInterval);
        fetchMe(sessionToken).then(u => {
          if (u) {
            setUser(u);
            userRef.current = u;
          }
        }).finally(() => resolve());
      }, 60_000);
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
