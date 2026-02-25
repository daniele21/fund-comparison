import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  plan: string;
  status: string;
  roles: string[];
  created_at: string;
  last_login_at?: string;
}

const env = (import.meta as any).env as Record<string, string> | undefined;
const API_BASE = (env && env.VITE_API_BASE) || 'http://localhost:8000';

export const AdminPanel: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = selectedTab === 'pending' 
        ? `${API_BASE}/api/admin/users/pending`
        : `${API_BASE}/api/admin/users`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail || `Status ${response.status}`;
        
        // If token is invalid, log out and prompt re-login
        if (detail === 'Invalid token' || detail === 'Not authenticated') {
          setError('La tua sessione è scaduta. Effettua nuovamente il login.');
          setTimeout(() => {
            logout();
          }, 2000);
          return;
        }
        
        throw new Error(`Errore nel caricamento degli utenti: ${detail}`);
      }

      const data = await response.json();
      // Backend returns {items: [...], next_cursor: ...} for /api/admin/users
      // and an array for /api/admin/users/pending
      setUsers(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user, selectedTab]);

  const handleApprove = async (userId: string) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE}/api/admin/users/approve`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ 
          user_id: userId,
          action: 'approve'
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'approvazione dell\'utente');
      }

      // Ricarica la lista
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore nell\'approvazione');
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Sei sicuro di voler rifiutare questo utente?')) {
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE}/api/admin/users/reject`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Errore nel rifiuto dell\'utente');
      }

      // Ricarica la lista
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore nel rifiuto');
    }
  };

  const handleChangePlan = async (userId: string, newPlan: 'free' | 'full-access') => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE}/api/admin/users/update-plan?user_id=${userId}&plan=${newPlan}`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Errore nel cambio piano');
      }

      // Ricarica la lista
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore nel cambio piano');
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          Non hai i permessi per accedere a questa sezione.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500 dark:text-slate-400">
              AMMINISTRAZIONE
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Pannello Admin
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Gestisci gli utenti e le richieste di accesso
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              👑 Admin
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/80 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedTab === 'pending'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            In attesa di approvazione
          </button>
          <button
            onClick={() => setSelectedTab('all')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedTab === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Tutti gli utenti
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Caricamento utenti...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              {error.includes('sessione è scaduta') || error.includes('Invalid token') || error.includes('Not authenticated') ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Verrai reindirizzato alla pagina di login tra pochi secondi...
                  </p>
                  <button
                    onClick={() => logout()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Vai al Login
                  </button>
                </div>
              ) : (
                <button
                  onClick={fetchUsers}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Riprova
                </button>
              )}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {selectedTab === 'pending' 
                ? 'Nessun utente in attesa di approvazione'
                : 'Nessun utente trovato'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Utente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Piano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Ruoli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Registrato il
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {u.name || 'N/A'}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {u.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.plan === 'full-access'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : u.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(u.created_at).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {selectedTab === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                            >
                              Approva
                            </button>
                            <button
                              onClick={() => handleReject(u.id)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                            >
                              Rifiuta
                            </button>
                          </>
                        ) : (
                          // Show plan changer for non-admin users
                          !u.roles.includes('admin') && (
                            <select
                              value={u.plan}
                              onChange={(e) => handleChangePlan(u.id, e.target.value as 'free' | 'full-access')}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
                            >
                              <option value="free">Free</option>
                              <option value="full-access">Full Access</option>
                            </select>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
