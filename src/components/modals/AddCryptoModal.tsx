'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/lib/store';

export function AddCryptoModal({ onClose }: { onClose: () => void }) {
  const { addCryptoHolding } = useApp();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !name || !quantity || !avgBuyPrice || !currentPrice) return;
    await addCryptoHolding({
      symbol: symbol.toUpperCase(),
      name,
      quantity: parseFloat(quantity),
      avgBuyPrice: parseFloat(avgBuyPrice),
      currentPrice: parseFloat(currentPrice),
      priceChange24h: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-surface-900">Add Crypto Position</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Symbol</label>
              <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="BTC" className="input-field uppercase" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Bitcoin" className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Quantity</label>
            <input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0.5" className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Avg Buy Price ($)</label>
              <input type="number" step="0.01" value={avgBuyPrice} onChange={e => setAvgBuyPrice(e.target.value)} placeholder="50000" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Current Price ($)</label>
              <input type="number" step="0.01" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} placeholder="97000" className="input-field" required />
            </div>
          </div>

          {quantity && currentPrice && (
            <div className="p-3 rounded-xl bg-surface-50 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Position Value</span>
                <span className="font-semibold text-surface-800">${(parseFloat(quantity) * parseFloat(currentPrice)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {avgBuyPrice && (
                <div className="flex justify-between mt-1">
                  <span className="text-surface-500">P&L</span>
                  <span className={`font-semibold ${parseFloat(currentPrice) >= parseFloat(avgBuyPrice) ? 'text-success-600' : 'text-danger-600'}`}>
                    ${((parseFloat(currentPrice) - parseFloat(avgBuyPrice)) * parseFloat(quantity)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#f7931a] to-[#627eea] hover:shadow-lg transition-all">
            Add Crypto Position
          </button>
        </form>
      </div>
    </div>
  );
}
