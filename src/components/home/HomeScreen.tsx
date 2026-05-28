'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { IdeaAI, PRIORITY_CONFIG } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSnackbar } from '@/components/ui/Snackbar';

export function HomeScreen() {
  const [ideas, setIdeas] = useState<IdeaAI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { showSnackbar } = useSnackbar();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchIdeas();
  }, []);

  // Listen for new/updated ideas
  useEffect(() => {
    const handleRefresh = () => fetchIdeas();
    window.addEventListener('idea-created', handleRefresh);
    window.addEventListener('idea-updated', handleRefresh);
    return () => {
      window.removeEventListener('idea-created', handleRefresh);
      window.removeEventListener('idea-updated', handleRefresh);
    };
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await fetch('/api/ideas?status=active');
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.ideas || []);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    showSnackbar('Hotovo ✓');
    await fetch('/api/ideas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'done' }),
    });
  };

  const critical = ideas.filter(i => i.priority === 'red');
  const active = ideas.filter(i => i.priority === 'yellow');
  const blueIdeas = ideas.filter(i => i.priority === 'blue');
  const future = ideas.filter(i => i.priority === 'purple');

  const doneToday = 0; // TODO: fetch from archive

  // Profile fullscreen overlay
  if (showProfile) {
    return (
      <div className="h-full relative">
        <ProfileScreen onBack={() => setShowProfile(false)} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overscroll-contain pb-6">
      {/* Header */}
      <PageHeader
        title="DecisionUp"
        rightContent={
          <button onClick={() => setShowProfile(true)} className="flex-shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border-2 border-slate-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400 border-2 border-slate-700">
                {(user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
          </button>
        }
      />

      <div className="px-4">
        {/* Date */}
        <p className="text-xs text-slate-500 mb-4">
          {new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{ideas.length}</p>
          <p className="text-[10px] text-slate-500 uppercase mt-0.5">Aktivní</p>
        </div>
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{critical.length}</p>
          <p className="text-[10px] text-red-400/60 uppercase mt-0.5">Kritické</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{doneToday}</p>
          <p className="text-[10px] text-slate-500 uppercase mt-0.5">Hotovo</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">✨</span>
          <p className="text-slate-400 text-sm">Žádné aktivní nápady</p>
          <p className="text-slate-600 text-xs mt-1">Swipni doprava na Inbox</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Critical section */}
          {critical.length > 0 && (
            <Section title="Kritické" color="red" ideas={critical} onDone={handleDone} />
          )}

          {/* Active section */}
          {active.length > 0 && (
            <Section title="Aktivní" color="yellow" ideas={active} onDone={handleDone} />
          )}

          {/* Ideas section */}
          {blueIdeas.length > 0 && (
            <Section title="Nápady" color="blue" ideas={blueIdeas} onDone={handleDone} />
          )}

          {/* Future section */}
          {future.length > 0 && (
            <Section title="Budoucnost" color="purple" ideas={future} onDone={handleDone} />
          )}
        </div>
      )}
      </div>
    </div>
  );
}

function Section({ title, color, ideas, onDone }: { title: string; color: string; ideas: IdeaAI[]; onDone: (id: string) => void }) {
  const colorMap: Record<string, string> = {
    red: 'text-red-400 border-red-500/30',
    yellow: 'text-amber-400 border-amber-500/30',
    blue: 'text-blue-400 border-blue-500/30',
    purple: 'text-purple-400 border-purple-500/30',
  };

  const dotMap: Record<string, string> = {
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const handleNavigate = (ideaId: string) => {
    window.dispatchEvent(new CustomEvent('navigate-idea', { detail: ideaId }));
    window.dispatchEvent(new CustomEvent('navigate-screen', { detail: 2 }));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${dotMap[color]}`} />
        <span className={`text-xs font-semibold uppercase ${colorMap[color]?.split(' ')[0]}`}>
          {title}
        </span>
        <span className="text-xs text-slate-600">({ideas.length})</span>
      </div>
      <div className="space-y-1.5">
        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea} onDone={onDone} onNavigate={handleNavigate} />
        ))}
      </div>
    </div>
  );
}

function IdeaCard({ idea, onDone, onNavigate }: { idea: IdeaAI; onDone: (id: string) => void; onNavigate: (id: string) => void }) {
  const x = useMotionValue(0);
  const bgOpacityRight = useTransform(x, [0, 80], [0, 1]);
  const bgOpacityLeft = useTransform(x, [-80, 0], [1, 0]);
  const checkScale = useTransform(x, [0, 80], [0.5, 1]);
  const archiveScale = useTransform(x, [-80, 0], [1, 0.5]);
  const [swiped, setSwiped] = useState(false);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 80) {
      setSwiped(true);
      animate(x, 400, { duration: 0.3 });
      setTimeout(() => onDone(idea.id), 300);
    } else if (info.offset.x < -80) {
      setSwiped(true);
      animate(x, -400, { duration: 0.3 });
      setTimeout(() => {
        fetch('/api/ideas', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: idea.id, status: 'archived' }),
        });
      }, 300);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  if (swiped) return null;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Green background - swipe right (Done) */}
      <motion.div
        className="absolute inset-0 bg-green-500/20 flex items-center pl-4"
        style={{ opacity: bgOpacityRight }}
      >
        <motion.div style={{ scale: checkScale }}>
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Red background - swipe left (Archive) */}
      <motion.div
        className="absolute inset-0 bg-red-500/20 flex items-center justify-end pr-4"
        style={{ opacity: bgOpacityLeft }}
      >
        <motion.div style={{ scale: archiveScale }}>
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Draggable card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        onPointerDownCapture={(e) => e.stopPropagation()}
        onClick={() => onNavigate(idea.id)}
        className="relative flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl cursor-pointer active:bg-slate-800/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[15px] text-white font-medium leading-snug truncate">{idea.title}</p>
          {idea.ai_label && (
            <span className="text-xs text-slate-500">{idea.ai_label}</span>
          )}
        </div>
        <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </motion.div>
    </div>
  );
}
