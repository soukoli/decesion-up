'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from '@/components/ui/Snackbar';
import { IdeaAI } from '@/types';

interface IdeaSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITY_EMOJI: Record<string, string> = {
  red: '🔴',
  yellow: '🟡',
  blue: '🔵',
  purple: '🟣',
};

export function IdeaSheet({ isOpen, onClose }: IdeaSheetProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    const content = text.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, source: 'text' }),
      });

      if (res.ok) {
        const { idea } = await res.json();

        // Create temporary idea for immediate UI feedback
        const tempIdea: Partial<IdeaAI> & { _processing: boolean } = {
          id: `temp-${idea.id}`,
          raw_id: idea.id,
          title: content,
          priority: 'blue',
          status: 'active',
          ai_label: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _processing: true,
        };

        // Notify Knowledge screen immediately (optimistic)
        window.dispatchEvent(new CustomEvent('idea-created', { detail: tempIdea }));

        setText('');
        onClose();

        // AI analyze in background
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_id: idea.id, content }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.idea) {
              const emoji = PRIORITY_EMOJI[data.idea.priority] || '🔵';
              const label = data.idea.ai_label || data.idea.title;
              showSnackbar(`✓ ${label} ${emoji}`);
            } else {
              showSnackbar('✓ Nápad uložen');
            }
            // Notify to refetch real data
            window.dispatchEvent(new Event('idea-updated'));
          })
          .catch(() => {
            showSnackbar('✓ Nápad uložen');
            window.dispatchEvent(new Event('idea-updated'));
          });
      }
    } catch {
      showSnackbar('Chyba při ukládání');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] theme-bg-muted rounded-t-2xl border-t theme-border shadow-2xl"
            style={{ height: '50dvh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full theme-bg-input" />
            </div>

            {/* Content */}
            <div className="flex flex-col h-[calc(100%-2rem)] px-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold theme-text">Nový nápad</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg theme-text-muted hover:theme-text hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Input area */}
              <div className="flex-1 mb-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Co tě napadá..."
                  autoFocus
                  inputMode="text"
                  className="w-full h-full theme-bg-input border theme-border rounded-xl p-4 text-base theme-text placeholder-[var(--text-faint)] resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="w-full py-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-semibold text-base hover:bg-amber-500/30 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? 'Ukládám...' : 'Uložit nápad'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
