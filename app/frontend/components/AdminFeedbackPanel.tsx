import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth';

interface FeedbackEntry {
  id: string;
  message: string;
  feedback_type: string;
  name?: string;
  email?: string;
  page_url?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  status: string; // new | read | archived
  created_at?: string;
  updated_at?: string;
}

interface FeedbackListResponse {
  items: FeedbackEntry[];
  next_cursor?: string | null;
}

const env = (import.meta as any).env as Record<string, string> | undefined;
const API_BASE = (env && env.VITE_API_BASE) || 'http://localhost:8000';

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  generic: 'Generico',
  missing_fund: 'Fondo mancante',
  wrong_data: 'Dati errati',
  other: 'Altro',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuovo',
  read: 'Letto',
  archived: 'Archiviato',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  read: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  archived: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const TYPE_COLORS: Record<string, string> = {
  generic: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  missing_fund: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  wrong_data: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  other: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export const AdminFeedbackPanel: React.FC = () => {
  const { token } = useAuth();
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      params.set('limit', '50');

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(
        `${API_BASE}/api/admin/feedbacks?${params.toString()}`,
        { credentials: 'include', headers },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Status ${response.status}`);
      }

      const data: FeedbackListResponse = await response.json();
      setFeedbacks(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, typeFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/admin/feedbacks/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dello status');
      }

      // Update locally
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo feedback?')) return;
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/api/admin/feedbacks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione del feedback');
      }

      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    }
  };

  const extractUserInfo = (metadata?: Record<string, unknown>) => {
    if (!metadata || !metadata.user) return null;
    const u = metadata.user as Record<string, unknown>;
    return {
      email: u.email as string | undefined,
      id: u.id as string | undefined,
      plan: u.plan as string | undefined,
    };
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Tutti gli stati</option>
          <option value="new">Nuovo</option>
          <option value="read">Letto</option>
          <option value="archived">Archiviato</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Tutti i tipi</option>
          <option value="generic">Generico</option>
          <option value="missing_fund">Fondo mancante</option>
          <option value="wrong_data">Dati errati</option>
          <option value="other">Altro</option>
        </select>

        <button
          onClick={fetchFeedbacks}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Aggiorna
        </button>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Caricamento feedback...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchFeedbacks}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Riprova
            </button>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Nessun feedback trovato.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {feedbacks.map((fb) => {
              const userInfo = extractUserInfo(fb.metadata);
              const isExpanded = expandedId === fb.id;

              return (
                <div
                  key={fb.id}
                  className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            TYPE_COLORS[fb.feedback_type] || TYPE_COLORS.generic
                          }`}
                        >
                          {FEEDBACK_TYPE_LABELS[fb.feedback_type] || fb.feedback_type}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[fb.status] || STATUS_COLORS.new
                          }`}
                        >
                          {STATUS_LABELS[fb.status] || fb.status}
                        </span>
                        {fb.created_at && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(fb.created_at).toLocaleDateString('it-IT', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {/* User info */}
                      {(userInfo?.email || userInfo?.id || fb.email) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Da: <span className="font-medium">{userInfo?.email || fb.email || userInfo?.id || 'Anonimo'}</span>
                          {userInfo?.plan && (
                            <span className="ml-2 text-xs text-slate-400">({userInfo.plan})</span>
                          )}
                        </p>
                      )}

                      {/* Message */}
                      <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
                        {fb.message}
                      </p>

                      {/* Expand / collapse extra details */}
                      {(fb.page_url || fb.user_agent || fb.metadata) && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          {isExpanded ? 'Nascondi dettagli ▲' : 'Mostra dettagli ▼'}
                        </button>
                      )}

                      {isExpanded && (
                        <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                          {fb.page_url && (
                            <p>
                              <span className="font-medium">Pagina:</span>{' '}
                              <a
                                href={fb.page_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {fb.page_url}
                              </a>
                            </p>
                          )}
                          {fb.user_agent && (
                            <p>
                              <span className="font-medium">User Agent:</span> {fb.user_agent}
                            </p>
                          )}
                          {fb.metadata && (
                            <details className="mt-1">
                              <summary className="font-medium cursor-pointer">Metadata</summary>
                              <pre className="mt-1 text-[11px] bg-slate-100 dark:bg-slate-900 rounded p-2 overflow-x-auto">
                                {JSON.stringify(fb.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {fb.status === 'new' && (
                        <button
                          onClick={() => handleStatusChange(fb.id, 'read')}
                          title="Segna come letto"
                          className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        >
                          ✓ Letto
                        </button>
                      )}
                      {fb.status === 'read' && (
                        <button
                          onClick={() => handleStatusChange(fb.id, 'archived')}
                          title="Archivia"
                          className="rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                        >
                          📦 Archivia
                        </button>
                      )}
                      {fb.status === 'archived' && (
                        <button
                          onClick={() => handleStatusChange(fb.id, 'new')}
                          title="Riapri"
                          className="rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        >
                          ↩ Riapri
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(fb.id)}
                        title="Elimina"
                        className="rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackPanel;
