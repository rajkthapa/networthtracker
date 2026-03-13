'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/store';

export function AddCryptoModal({ onClose }: { onClose: () => void }) {
  const { addCryptoHolding } = useApp();
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!symbol || !quantity) {
      setError('Symbol and quantity are required');
      return;
    }
    if (parseFloat(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      await addCryptoHolding({
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        avgBuyPrice: avgBuyPrice ? parseFloat(avgBuyPrice) : 0,
        currentPrice: currentPrice ? parseFloat(currentPrice) : 0,
        priceChange24h: 0,
      });
      onClose();
    } catch {
      setError('Failed to save crypto position. Please try again.');
      setSaving(false);
    }
  };

  const qty = parseFloat(quantity) || 0;
  const curPrice = parseFloat(currentPrice) || 0;
  const buyPrice = parseFloat(avgBuyPrice) || 0;
  const positionValue = qty * curPrice;
  const pnl = (curPrice - buyPrice) * qty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-th-card rounded-3xl shadow-[var(--shadow-glass)] border border-[var(--border-color)] animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-th-heading">Add Crypto Position</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors">
            <X className="w-5 h-5 text-th-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Symbol <span className="text-danger-400">*</span></label>
            <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="BTC" className="input-field uppercase" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Quantity <span className="text-danger-400">*</span></label>
            <input type="number" step="any" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0.5" className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-th-body mb-1.5">Avg Buy Price ($)</label>
              <input type="number" step="0.01" min="0" value={avgBuyPrice} onChange={e => setAvgBuyPrice(e.target.value)} placeholder="Optional" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-th-body mb-1.5">Current Price ($)</label>
              <input type="number" step="0.01" min="0" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} placeholder="Optional" className="input-field" />
            </div>
          </div>

          <p className="text-xs text-th-faint">Prices can be fetched automatically after adding via the Refresh Prices button.</p>

          {qty > 0 && curPrice > 0 && (
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] text-sm">
              <div className="flex justify-between">
                <span className="text-th-muted">Position Value</span>
                <span className="font-semibold text-th-heading num">${positionValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {buyPrice > 0 && (
                <div className="flex justify-between mt-1">
                  <span className="text-th-muted">P&L</span>
                  <span className={`font-semibold num ${pnl >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
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
              'Add Crypto Position'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
