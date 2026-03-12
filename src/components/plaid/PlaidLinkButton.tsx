'use client';

import { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Link2, Loader2, CheckCircle2 } from 'lucide-react';

interface PlaidLinkButtonProps {
  onSuccess?: (result: { accounts_created: number; transactions_imported: number; institution: string }) => void;
}

export default function PlaidLinkButton({ onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [result, setResult] = useState<{
    accounts_created: number;
    transactions_imported: number;
    institution: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLinkToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plaid/create-link-token', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create link token');
      setLinkToken(data.link_token);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const onPlaidSuccess = useCallback(async (publicToken: string) => {
    setExchanging(true);
    setError(null);
    try {
      const res = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect');
      setResult(data);
      onSuccess?.(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExchanging(false);
      setLinkToken(null);
    }
  }, [onSuccess]);

  const onPlaidExit = useCallback(() => {
    setLoading(false);
    setLinkToken(null);
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  });

  // Auto-open Plaid Link once token is ready
  const handleClick = async () => {
    if (linkToken && ready) {
      open();
    } else {
      await fetchLinkToken();
    }
  };

  // Open automatically when link token arrives
  if (linkToken && ready && loading) {
    setLoading(false);
    open();
  }

  if (result) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-success-500/15 text-success-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-th-heading mb-2">
          {result.institution} Connected!
        </h3>
        <p className="text-sm text-th-muted mb-1">
          {result.accounts_created} account{result.accounts_created !== 1 ? 's' : ''} imported
        </p>
        <p className="text-sm text-th-muted mb-6">
          {result.transactions_imported} transaction{result.transactions_imported !== 1 ? 's' : ''} imported
        </p>
        <button
          onClick={() => setResult(null)}
          className="btn-secondary mr-3"
        >
          Connect Another Bank
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-sm text-danger-300">
          {error}
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={loading || exchanging}
        className="btn-accent inline-flex items-center gap-2"
      >
        {loading || exchanging ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {exchanging ? 'Importing accounts...' : 'Connecting...'}
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            Connect with Plaid
          </>
        )}
      </button>
    </div>
  );
}
