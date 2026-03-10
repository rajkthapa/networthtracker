'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/store';

export function AddStockModal({ onClose, accountId, accountName }: { onClose: () => void; accountId: string; accountName: string }) {
  const { addStockHolding } = useApp();
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [avgCostBasis, setAvgCostBasis] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!ticker || !shares || !avgCostBasis) {
      setError('Please fill all fields');
      return;
    }
    setSaving(true);
    try {
      await addStockHolding({
        accountId,
        ticker: ticker.toUpperCase(),
        name: ticker.toUpperCase(),
        shares: parseFloat(shares),
        avgCostBasis: parseFloat(avgCostBasis),
        currentPrice: 0,
        priceChange24h: 0,
      });
      onClose();
    } catch {
      setError('Failed to save stock position. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Add Stock Position</h2>
            <p className="text-xs text-surface-400 mt-0.5">to {accountName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Ticker</label>
            <input type="text" value={ticker} onChange={e => setTicker(e.target.value)} placeholder="AAPL" className="input-field uppercase" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Number of Shares</label>
            <input type="number" step="any" value={shares} onChange={e => setShares(e.target.value)} placeholder="100" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Avg Cost Basis ($)</label>
            <input type="number" step="0.01" value={avgCostBasis} onChange={e => setAvgCostBasis(e.target.value)} placeholder="150.00" className="input-field" required />
          </div>

          {shares && avgCostBasis && (
            <div className="p-3 rounded-xl bg-surface-50 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Total Cost</span>
                <span className="font-semibold text-surface-800">${(parseFloat(shares) * parseFloat(avgCostBasis)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-grape-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Add Stock Position'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
