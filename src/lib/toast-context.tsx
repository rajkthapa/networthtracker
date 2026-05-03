'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border animate-slide-up min-w-[280px] max-w-[400px]"
            style={{
              background: 'var(--toast-bg, var(--bg-card))',
              borderColor: t.type === 'success' ? 'var(--border-teal, rgba(20,184,166,0.3))' : 'rgba(239,68,68,0.3)',
            }}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[var(--text-positive)] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[var(--text-negative)] shrink-0" />
            )}
            <p className="text-sm font-medium text-th-heading flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="p-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors shrink-0">
              <X className="w-3.5 h-3.5 text-th-faint" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
