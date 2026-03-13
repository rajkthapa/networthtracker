'use client';

import { useState, useEffect } from 'react';
import { Building2, RefreshCw, Loader2 } from 'lucide-react';

interface Connection {
  id: string;
  institution_name: string;
  institution_id: string | null;
  last_synced_at: string | null;
  created_at: string;
}

interface PlaidConnectionsListProps {
  refreshKey?: number;
}

export default function PlaidConnectionsList({ refreshKey }: PlaidConnectionsListProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/plaid/connections');
      const data = await res.json();
      if (res.ok) setConnections(data.connections || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [refreshKey]);

  const handleSync = async (connectionId: string) => {
    setSyncingId(connectionId);
    setSyncResult(null);
    try {
      const res = await fetch('/api/plaid/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plaid_item_id: connectionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyncResult(
        `Synced: +${data.transactions_added} transactions, ${data.balances_updated} balances updated`
      );
      fetchConnections();
    } catch (e: any) {
      setSyncResult(`Sync failed: ${e.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  if (loading) return null;
  if (connections.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-th-body mb-3">Linked Banks</h4>

      {syncResult && (
        <div className="mb-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-sm text-[var(--text-accent)]">
          {syncResult}
        </div>
      )}

      <div className="space-y-2">
        {connections.map(conn => (
          <div
            key={conn.id}
            className="flex items-center justify-between p-3 rounded-xl bg-th-card/80 border border-[var(--border-color)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-th-heading">{conn.institution_name}</p>
                <p className="text-xs text-th-faint">
                  {conn.last_synced_at
                    ? `Last synced ${new Date(conn.last_synced_at).toLocaleDateString()}`
                    : `Connected ${new Date(conn.created_at).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSync(conn.id)}
              disabled={syncingId === conn.id}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover-strong)] transition-colors text-th-faint hover:text-th-body disabled:opacity-50"
              title="Sync transactions"
            >
              {syncingId === conn.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
