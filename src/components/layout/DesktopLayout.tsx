'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeScreen } from '@/components/home/HomeScreen';
import { FeedScreen } from '@/components/feed/FeedScreen';
import { KnowledgeScreen } from '@/components/knowledge/KnowledgeScreen';
import { useSnackbar } from '@/components/ui/Snackbar';
import { IdeaAI } from '@/types';

type Screen = 'home' | 'feed' | 'knowledge';

const NAV_ITEMS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )},
  { id: 'feed', label: 'Feed', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  )},
  { id: 'knowledge', label: 'Knowledge', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  )},
];

const PRIORITY_EMOJI: Record<string, string> = {
  red: '🔴',
  yellow: '🟡',
  blue: '🔵',
  purple: '🟣',
};

export function DesktopLayout() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaText, setIdeaText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const renderContent = () => {
    switch (activeScreen) {
      case 'home': return <HomeScreen />;
      case 'feed': return <FeedScreen />;
      case 'knowledge': return <KnowledgeScreen />;
    }
  };

  const handleSubmitIdea = async () => {
    const content = ideaText.trim();
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

        const tempIdea: Partial<IdeaAI> & { _processing: boolean } = {
          id: `temp-${idea.id}`,
          raw_id: idea.id,
          title: content,
          priority: 'blue',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          _processing: true,
        };

        window.dispatchEvent(new CustomEvent('idea-created', { detail: tempIdea }));

        setIdeaText('');
        setShowIdeaModal(false);

        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_id: idea.id, content }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.idea?.ai_label) {
              const emoji = PRIORITY_EMOJI[data.idea.priority] || '🔵';
              showSnackbar(`✓ ${data.idea.ai_label} ${emoji}`);
            } else {
              showSnackbar('✓ Nápad uložen');
            }
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

  return (
    <div className="h-dvh flex theme-bg">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r theme-border flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b theme-border">
          <h1 className="text-lg font-bold theme-text tracking-tight uppercase">DecisionUp</h1>
          <p className="text-[10px] theme-text-muted mt-0.5">Signal, not noise</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeScreen === item.id
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'theme-text-muted hover:theme-bg-card hover:theme-text'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Add idea button */}
        <div className="p-3 border-t theme-border">
          <button
            onClick={() => setShowIdeaModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/40 hover:bg-violet-500/30 active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-sm font-medium">Nový nápad</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <p className="text-[10px] theme-text-faint">DecisionUp v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* Idea Modal (centered popup) */}
      <AnimatePresence>
        {showIdeaModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70]"
              onClick={() => setShowIdeaModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg theme-bg-muted rounded-2xl border theme-border shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold theme-text">Nový nápad</h2>
                <button
                  onClick={() => setShowIdeaModal(false)}
                  className="p-2 rounded-lg theme-text-muted hover:theme-text hover:theme-bg-card transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitIdea(); } }}
                placeholder="Co tě napadá..."
                autoFocus
                className="w-full h-32 theme-bg-input border theme-border rounded-xl p-4 text-base text-white placeholder-[var(--text-faint)] resize-none focus:outline-none focus:border-violet-500/50 transition-colors"
              />

              <button
                onClick={handleSubmitIdea}
                disabled={!ideaText.trim() || submitting}
                className="w-full mt-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/50 text-violet-400 font-semibold hover:bg-violet-500/30 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? 'Ukládám...' : 'Uložit nápad'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
