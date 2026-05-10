import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

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

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx.toast;
};

// ── Visual component ──────────────────────────────────────────────────────────

const config: Record<ToastType, { bg: string; border: string; color: string; icon: string; bar: string }> = {
  success: { bg: '#f0fdf4', border: '#86efac', color: '#15803d', icon: '✓', bar: '#22c55e' },
  error:   { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', icon: '✕', bar: '#ef4444' },
  warning: { bg: '#fffbeb', border: '#fcd34d', color: '#b45309', icon: '!', bar: '#f59e0b' },
  info:    { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8', icon: 'i', bar: '#3b82f6' },
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20,
      zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const c = config[toast.type];

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        minWidth: 280, maxWidth: 380,
        overflow: 'hidden',
        pointerEvents: 'all',
        animation: 'toastIn 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
        {/* Icon badge */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: c.bar, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>
          {c.icon}
        </div>

        {/* Message */}
        <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#0f172a', margin: 0 }}>
          {toast.message}
        </p>

        {/* Close */}
        <button
          onClick={() => onDismiss(toast.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 16, color: '#94a3b8', padding: '0 2px', lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: `${c.bar}22` }}>
        <div style={{
          height: 3, background: c.bar,
          animation: 'toastBar 3.5s linear forwards',
        }} />
      </div>
    </div>
  );
}
