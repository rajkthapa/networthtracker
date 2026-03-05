'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Image, Table2, Link2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/store';

type ImportMethod = 'csv' | 'pdf' | 'image' | 'plaid' | 'manual';

export default function ImportPage() {
  const { addTransaction } = useApp();
  const [activeMethod, setActiveMethod] = useState<ImportMethod>('csv');
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual transaction form
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'other_expense',
  });

  const methods = [
    { id: 'csv' as const, name: 'CSV / Excel', icon: Table2, description: 'Import from spreadsheet files', color: 'text-success-600 bg-success-100' },
    { id: 'pdf' as const, name: 'PDF Statement', icon: FileText, description: 'Extract from bank statements', color: 'text-primary-600 bg-primary-100' },
    { id: 'image' as const, name: 'Receipt Image', icon: Image, description: 'Scan receipts and invoices', color: 'text-grape-600 bg-grape-100' },
    { id: 'plaid' as const, name: 'Connect Bank', icon: Link2, description: 'Link via Plaid (coming soon)', color: 'text-cyan-600 bg-cyan-100' },
    { id: 'manual' as const, name: 'Manual Entry', icon: Plus, description: 'Add transactions manually', color: 'text-warning-600 bg-warning-100' },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;
    setImportStatus('processing');

    // Simulate import processing
    setTimeout(() => {
      const count = Math.floor(Math.random() * 20) + 10;
      setImportedCount(count);
      setImportStatus('success');

      // Add some demo transactions
      for (let i = 0; i < Math.min(count, 5); i++) {
        addTransaction({
          date: new Date().toISOString().split('T')[0],
          description: `Imported Transaction #${i + 1}`,
          amount: Math.round(Math.random() * 200 + 20),
          type: Math.random() > 0.3 ? 'expense' : 'income',
          category: Math.random() > 0.3 ? 'shopping' : 'freelance',
        });
      }
    }, 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.amount || !manualForm.description) return;
    addTransaction({
      date: manualForm.date,
      description: manualForm.description,
      amount: parseFloat(manualForm.amount),
      type: manualForm.type,
      category: manualForm.category,
    });
    setManualForm({ ...manualForm, description: '', amount: '' });
    setImportStatus('success');
    setImportedCount(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Import Transactions</h1>
        <p className="text-sm text-surface-500 mt-1">Import your financial data from various sources</p>
      </div>

      {/* Import Methods */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {methods.map(method => {
          const Icon = method.icon;
          const isActive = activeMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => { setActiveMethod(method.id); setImportStatus('idle'); }}
              className={`p-4 rounded-2xl border-2 transition-all text-center ${
                isActive ? 'border-primary-500 bg-primary-50 shadow-glow-primary' : 'border-surface-100 bg-white/80 hover:border-surface-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${method.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-surface-800">{method.name}</p>
              <p className="text-[10px] text-surface-400 mt-0.5">{method.description}</p>
            </button>
          );
        })}
      </div>

      {/* Import Area */}
      {activeMethod !== 'manual' && activeMethod !== 'plaid' && (
        <div
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-surface-200 bg-white/40 hover:border-surface-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {importStatus === 'idle' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-surface-800 mb-2">
                Drop your {activeMethod === 'csv' ? 'CSV/Excel' : activeMethod === 'pdf' ? 'PDF' : 'image'} file here
              </h3>
              <p className="text-sm text-surface-400 mb-4">
                or click to browse your files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={activeMethod === 'csv' ? '.csv,.xlsx,.xls' : activeMethod === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png,.webp'}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                Choose File
              </button>
              <p className="text-xs text-surface-400 mt-4">
                Supported: {activeMethod === 'csv' ? 'CSV, XLSX, XLS' : activeMethod === 'pdf' ? 'PDF bank statements' : 'JPG, PNG, WebP receipts'}
              </p>
            </>
          )}

          {importStatus === 'processing' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto animate-pulse-soft">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-surface-800">Processing your file...</h3>
              <div className="w-48 h-2 bg-surface-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #4c6ef5 0%, #be4bdb 50%, #4c6ef5 100%)' }} />
              </div>
              <p className="text-sm text-surface-500">Extracting transactions...</p>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-success-100 text-success-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-surface-800">Import Successful!</h3>
              <p className="text-sm text-surface-500">{importedCount} transactions imported</p>
              <button onClick={() => setImportStatus('idle')} className="btn-secondary">
                Import More
              </button>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-danger-100 text-danger-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-surface-800">Import Failed</h3>
              <p className="text-sm text-surface-500">There was an error processing your file</p>
              <button onClick={() => setImportStatus('idle')} className="btn-secondary">
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Plaid Connection */}
      {activeMethod === 'plaid' && (
        <div className="chart-container text-center py-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-100 to-primary-100 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-10 h-10 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold text-surface-800 mb-2">Connect Your Bank Account</h3>
          <p className="text-sm text-surface-500 max-w-md mx-auto mb-6">
            Securely link your bank accounts through Plaid to automatically import transactions and track balances in real-time.
          </p>
          <button className="btn-accent">
            Connect with Plaid (Coming Soon)
          </button>
          <p className="text-xs text-surface-400 mt-4">Supports 12,000+ financial institutions</p>
        </div>
      )}

      {/* Manual Entry */}
      {activeMethod === 'manual' && (
        <div className="chart-container max-w-lg mx-auto">
          <h3 className="section-header mb-4">Quick Add Transaction</h3>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex bg-surface-100 rounded-xl p-1 mb-4">
              <button
                type="button"
                onClick={() => setManualForm({ ...manualForm, type: 'expense', category: 'other_expense' })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  manualForm.type === 'expense' ? 'bg-danger-500 text-white shadow-md' : 'text-surface-500'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setManualForm({ ...manualForm, type: 'income', category: 'other_income' })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  manualForm.type === 'income' ? 'bg-success-500 text-white shadow-md' : 'text-surface-500'
                }`}
              >
                Income
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-semibold">$</span>
                <input type="number" step="0.01" value={manualForm.amount} onChange={e => setManualForm({ ...manualForm, amount: e.target.value })} placeholder="0.00" className="input-field pl-8 text-xl font-bold" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Description</label>
              <input type="text" value={manualForm.description} onChange={e => setManualForm({ ...manualForm, description: e.target.value })} placeholder="What was this for?" className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Date</label>
              <input type="date" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} className="input-field" />
            </div>

            <button type="submit" className={`w-full py-3.5 rounded-xl font-semibold text-white ${
              manualForm.type === 'expense' ? 'bg-gradient-to-r from-danger-500 to-accent-500' : 'bg-gradient-to-r from-success-500 to-teal-500'
            }`}>
              Add Transaction
            </button>
          </form>

          {importStatus === 'success' && (
            <div className="mt-4 p-3 rounded-xl bg-success-50 border border-success-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              <p className="text-sm text-success-700 font-medium">Transaction added successfully!</p>
            </div>
          )}
        </div>
      )}

      {/* Import Tips */}
      <div className="chart-container bg-gradient-to-br from-surface-50 to-primary-50/20">
        <h3 className="section-header mb-4">Import Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/60 rounded-2xl">
            <p className="text-2xl mb-2">📊</p>
            <p className="text-sm font-semibold text-surface-800">CSV Format</p>
            <p className="text-xs text-surface-500 mt-1">Include columns: Date, Description, Amount, Type (income/expense)</p>
          </div>
          <div className="p-4 bg-white/60 rounded-2xl">
            <p className="text-2xl mb-2">📄</p>
            <p className="text-sm font-semibold text-surface-800">PDF Statements</p>
            <p className="text-xs text-surface-500 mt-1">Works with most major bank statement formats including Chase, BofA, Wells Fargo</p>
          </div>
          <div className="p-4 bg-white/60 rounded-2xl">
            <p className="text-2xl mb-2">📸</p>
            <p className="text-sm font-semibold text-surface-800">Receipt Scanning</p>
            <p className="text-xs text-surface-500 mt-1">Take a photo of your receipt and we&apos;ll extract the amount and details</p>
          </div>
        </div>
      </div>
    </div>
  );
}
