import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

export const showToast = (message: string, type: ToastType = 'success') => {
  const toast: Toast = { id: ++toastId, type, message };
  listeners.forEach((fn) => fn(toast));
};

const icons = {
  success: { icon: CheckCircle, bg: 'bg-emerald-50 border-emerald-200', color: 'text-emerald-600', text: 'text-emerald-800' },
  error: { icon: XCircle, bg: 'bg-red-50 border-red-200', color: 'text-red-600', text: 'text-red-800' },
  info: { icon: AlertCircle, bg: 'bg-blue-50 border-blue-200', color: 'text-blue-600', text: 'text-blue-800' },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const meta = icons[toast.type];
          const Icon = meta.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg ${meta.bg} min-w-[280px] max-w-sm`}
            >
              <Icon size={20} className={`${meta.color} shrink-0`} />
              <p className={`text-sm font-semibold ${meta.text} flex-1`}>{toast.message}</p>
              <button onClick={() => remove(toast.id)} className={`${meta.color} hover:opacity-70 cursor-pointer`}>
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
