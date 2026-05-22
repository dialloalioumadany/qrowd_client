import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, Loader2, X } from 'lucide-react';

/* ── Types ── */
export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastOptions {
  duration?: number;
  id?: string;
}

interface ToastContextValue {
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  loading: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  toast: (message: string, type: ToastType, options?: ToastOptions) => string;
}

/* ── Context ── */
const ToastContext = createContext<ToastContextValue | null>(null);

/* ── Provider ── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((
    message: string,
    type: ToastType,
    options?: ToastOptions
  ) => {
    const id = options?.id || Math.random().toString(36).substring(2, 9);
    const duration = options?.duration ?? (type === 'loading' ? Infinity : 4000);

    setToasts((prev) => {
      // Si le toast existe déjà (mise à jour d'un chargement en succès par exemple)
      const exists = prev.some((t) => t.id === id);
      if (exists) {
        return prev.map((t) => (t.id === id ? { ...t, type, message, duration } : t));
      }
      return [...prev, { id, type, message, duration }];
    });

    if (duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  }, [dismiss]);

  const success = useCallback((msg: string, opts?: ToastOptions) => addToast(msg, 'success', opts), [addToast]);
  const error = useCallback((msg: string, opts?: ToastOptions) => addToast(msg, 'error', opts), [addToast]);
  const info = useCallback((msg: string, opts?: ToastOptions) => addToast(msg, 'info', opts), [addToast]);
  const loading = useCallback((msg: string, opts?: ToastOptions) => addToast(msg, 'loading', opts), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, loading, dismiss, toast: addToast }}>
      {children}

      {/* Container de Toasts flottants en haut à droite */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border shadow-xl backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(24, 48, 40, 0.96)', // Forest Dark transparent
                borderColor: t.type === 'success'
                  ? 'rgba(205, 232, 119, 0.3)' // Lime
                  : t.type === 'error'
                  ? 'rgba(239, 68, 68, 0.3)' // Red
                  : 'rgba(255, 255, 255, 0.1)',
                color: '#f2f1ec', // Off-White
              }}
            >
              <div className="flex items-center gap-3">
                {/* Icônes adaptées */}
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-[#cde877]" />}
                {t.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-400" />}
                {t.type === 'loading' && <Loader2 className="w-5 h-5 shrink-0 text-slate-300 animate-spin" />}

                <span className="text-[13px] font-medium tracking-[0.015em] leading-snug">
                  {t.message}
                </span>
              </div>

              {/* Bouton de fermeture manuel (sauf pour chargement en cours) */}
              {t.type !== 'loading' && (
                <button
                  onClick={() => dismiss(t.id)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ── Hook ── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return ctx;
}
