import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface AlertProps {
  message: string | null;
  onClose: () => void;
  type?: 'error' | 'success' | 'info';
}

export default function Alert({ message, onClose, type = 'error' }: AlertProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-24 left-6 right-6 z-[100] max-w-md mx-auto"
        >
          <div className={`
            flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-xl
            ${type === 'error' ? 'bg-rose-50/90 border-rose-200 text-rose-900' : ''}
            ${type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' : ''}
            ${type === 'info' ? 'bg-sky-50/90 border-sky-200 text-sky-900' : ''}
          `}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed">
                {message === 'Failed to fetch' 
                  ? 'Gagal terhubung ke server. Periksa koneksi internet kamu atau konfigurasi Supabase. 🥺' 
                  : message}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
