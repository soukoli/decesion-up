'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SnackbarState {
  message: string;
  onUndo?: () => void;
}

let showSnackbar: (message: string, onUndo?: () => void) => void;

export function useSnackbar() {
  return { showSnackbar: (message: string, onUndo?: () => void) => showSnackbar?.(message, onUndo) };
}

export function Snackbar() {
  const [state, setState] = useState<SnackbarState | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const dismiss = useCallback(() => {
    setState(null);
    if (timer) clearTimeout(timer);
  }, [timer]);

  showSnackbar = useCallback((message: string, onUndo?: () => void) => {
    if (timer) clearTimeout(timer);
    setState({ message, onUndo });
    const t = setTimeout(() => setState(null), 5000);
    setTimer(t);
  }, [timer]);

  const handleUndo = () => {
    state?.onUndo?.();
    dismiss();
  };

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-4 right-4 z-[60] flex items-center justify-between px-4 py-3 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40"
        >
          <span className="text-sm text-white">{state.message}</span>
          {state.onUndo && (
            <button
              onClick={handleUndo}
              className="ml-3 px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              UNDO
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
