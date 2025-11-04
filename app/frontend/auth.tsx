import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AuthUser } from './types';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const env = (import.meta as any).env as Record<string, string> | undefined;
const API_BASE = (env && env.VITE_API_BASE) || 'http://localhost:8000';

async function fetchMe(token?: string): Promise<AuthUser | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    // If token provided, use it as Bearer auth
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[Auth] Calling /auth/me with Bearer token');
    } else {
      console.log('[Auth] Calling /auth/me with cookies only');
    }
    
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include', // Always send cookies too
      headers,
    });
    
    console.log('[Auth] /auth/me response status:', res.status);
    
    if (!res.ok) return null;
    const data = await res.json();
    console.log('[Auth] /auth/me returned user:', data);
    return data;
  } catch (e) {
    console.warn('[Auth] fetchMe error:', e);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }>= ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await fetchMe();
      if (mounted) setUser(u);
      if (mounted) setLoading(false);
    })();

    // Listen for popup postMessage (popup flow sends { type: 'oauth', provider, status, token })
    function onMessage(e: MessageEvent) {
      // Log ALL messages for debugging
      console.log('[Auth] 🔔 PostMessage received:', {
        origin: e.origin,
        data: e.data,
        source: e.source === window ? 'self' : 'other window'
      });
      
      try {
        // The postMessage comes FROM the backend callback page (which is on API_BASE domain)
        const expectedOrigin = new URL(API_BASE).origin;
        
        // Also accept localhost variant (127.0.0.1 and localhost are treated as same-site but different origins)
        const expectedOriginLocalhost = expectedOrigin.replace('127.0.0.1', 'localhost');
        const expectedOrigin127 = expectedOrigin.replace('localhost', '127.0.0.1');
        
        console.log('[Auth] Expected origins:', expectedOrigin, expectedOriginLocalhost, expectedOrigin127);
        
        // Only accept messages from our backend API's origin (with localhost/127.0.0.1 flexibility)
        const isValidOrigin = e.origin === expectedOrigin || 
                             e.origin === expectedOriginLocalhost || 
                             e.origin === expectedOrigin127;
        
        if (!isValidOrigin) {
          console.log('[Auth] ❌ Ignoring message from wrong origin. Got:', e.origin);
          return;
        }
        
        const payload = e.data;
        console.log('[Auth] ✅ Message from correct origin. Payload:', payload);
        
        if (payload && payload.type === 'oauth' && payload.status === 'success') {
          console.log('[Auth] 🎉 OAuth success message received!');
          // If backend provided a session token in the message, use it for auth
          const token = payload.token as string | undefined;
          if (token) {
            console.log('[Auth] 🔑 Token received in postMessage, length:', token.length);
            // Save token in memory (not persisted)
            (window as any).__APP_OAUTH_TOKEN = token;
          } else {
            console.log('[Auth] ⚠️ No token in postMessage payload');
          }
          // Call /auth/me with token (if available) or cookies
          fetchMe(token).then(data => {
            if (data) {
              console.log('[Auth] ✅ User authenticated:', data.email);
              setUser(data);
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

  const login = async () => {
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

      // Watch for user state change (set by global message listener)
      const checkInterval = setInterval(() => {
        if (user !== null) {
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
        // Try one more time to fetch user
        fetchMe().then(u => {
          if (u) setUser(u);
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
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
