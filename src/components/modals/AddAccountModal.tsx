'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/store';
import { ACCOUNT_TYPES, DEBT_TYPES } from '@/lib/utils';

export function AddAccountModal({ onClose }: { onClose: () => void }) {
  const { addAccount } = useApp();
  const [isDebt, setIsDebt] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const types = isDebt ? DEBT_TYPES : ACCOUNT_TYPES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !type || !balance) {
      setError(!type ? 'Please select an account type' : 'Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const typeInfo = types.find(t => t.id === type);
      await addAccount({
        name,
        type,
        balance: parseFloat(balance),
        institution,
        color: typeInfo?.color || '#14b8a6',
        icon: typeInfo?.icon || '💰',
        isDebt,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
      });
      onClose();
    } catch {
      setError('Failed to save account. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-th-card rounded-3xl shadow-[var(--shadow-glass)] border border-[var(--border-color)] animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-th-heading">Add Account</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors">
            <X className="w-5 h-5 text-th-muted" />
          </button>
        </div>

        <div className="px-6 mb-4">
          <div className="flex bg-[var(--bg-hover)] rounded-xl p-1">
            <button
              onClick={() => { setIsDebt(false); setType(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isDebt ? 'bg-success-500 text-white shadow-[var(--shadow-card)]' : 'text-th-muted'
              }`}
            >
              Asset
            </button>
            <button
              onClick={() => { setIsDebt(true); setType(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isDebt ? 'bg-danger-500 text-white shadow-[var(--shadow-card)]' : 'text-th-muted'
              }`}
            >
              Debt / Liability
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[var(--bg-negative-subtle)] border border-danger-500/30 text-[var(--text-negative)] text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Account Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Chase Checking" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-2">Account Type</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto scrollbar-hide">
              {types.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    type === t.id ? 'border-primary-500 bg-primary-500/10' : 'border-[var(--border-color)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-[10px] font-medium text-th-body">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Balance</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-th-faint font-semibold">$</span>
              <input type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00" className="input-field pl-8" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Institution (optional)</label>
            <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g., Chase, Fidelity" className="input-field" />
          </div>

          {isDebt && (
            <div>
              <label className="block text-sm font-medium text-th-body mb-1.5">Interest Rate % (optional)</label>
              <input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="e.g., 6.5" className="input-field" />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
              isDebt ? 'bg-danger-500 hover:bg-danger-600' : 'bg-success-500 hover:bg-success-600'
            }`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Add ${isDebt ? 'Debt' : 'Account'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
