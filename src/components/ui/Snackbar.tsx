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
          className="fixed bottom-24 left-4 right-4 z-[60] flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
        >
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{state.message}</span>
          {state.onUndo && (
            <button
              onClick={handleUndo}
              className="ml-3 px-3 py-1 text-xs font-semibold rounded-lg active:scale-95 transition-all"
              style={{ color: 'var(--accent-text)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
            >
              UNDO
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
