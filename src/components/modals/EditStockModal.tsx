'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useToast } from '@/lib/toast-context';
import { StockHolding } from '@/lib/types';

export function EditStockModal({ holding, onClose }: { holding: StockHolding; onClose: () => void }) {
  const { updateStockHolding } = useApp();
  const { toast } = useToast();
  const [shares, setShares] = useState(holding.shares.toString());
  const [avgCostBasis, setAvgCostBasis] = useState(holding.avgCostBasis.toString());
  const [name, setName] = useState(holding.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!shares || parseFloat(shares) <= 0) {
      setError('Shares must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      await updateStockHolding(holding.id, {
        name: name || holding.ticker,
        shares: parseFloat(shares),
        avgCostBasis: avgCostBasis ? parseFloat(avgCostBasis) : holding.avgCostBasis,
      });
      toast(`${holding.ticker} updated`);
      onClose();
    } catch {
      setError('Failed to update. Please try again.');
      setSaving(false);
    }
  };

  const qty = parseFloat(shares) || 0;
  const curPrice = holding.currentPrice;
  const costBasis = parseFloat(avgCostBasis) || 0;
  const positionValue = qty * curPrice;
  const pnl = (curPrice - costBasis) * qty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-th-card rounded-3xl shadow-[var(--shadow-glass)] border border-[var(--border-color)] animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-th-heading">Edit {holding.ticker}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors">
            <X className="w-5 h-5 text-th-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[var(--bg-negative-subtle)] border border-danger-500/30 text-[var(--text-negative)] text-sm">
              {error}
            </div>
          )}

          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-between">
            <span className="text-sm text-th-muted">Current Price</span>
            <span className="text-sm font-bold text-th-heading num">${curPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Shares <span className="text-[var(--text-negative)]">*</span></label>
            <input type="number" step="any" min="0" value={shares} onChange={e => setShares(e.target.value)} className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Avg Cost Basis ($)</label>
            <input type="number" step="0.01" min="0" value={avgCostBasis} onChange={e => setAvgCostBasis(e.target.value)} className="input-field" />
          </div>

          {qty > 0 && curPrice > 0 && (
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-th-muted">Position Value</span>
                <span className="font-semibold text-th-heading num">${positionValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {costBasis > 0 && (
                <div className="flex justify-between">
                  <span className="text-th-muted">P&L</span>
                  <span className={`font-semibold num ${pnl >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                    ${pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
