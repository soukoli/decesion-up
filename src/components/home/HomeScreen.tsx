'use client';

import { useEffect, useState } from 'react';
import { IdeaAI, PRIORITY_CONFIG } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { PageHeader } from '@/components/ui/PageHeader';

export function HomeScreen() {
  const [ideas, setIdeas] = useState<IdeaAI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<any>(null);
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
    try {
      await fetch('/api/ideas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'done' }),
      });
      setIdeas(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to complete idea:', err);
    }
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
          <IdeaCard key={idea.id} idea={idea} onDone={onDone} />
        ))}
      </div>
    </div>
  );
}

function IdeaCard({ idea, onDone }: { idea: IdeaAI; onDone: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl group">
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-white font-medium leading-snug truncate">{idea.title}</p>
        {idea.group && (
          <span className="text-[10px] text-slate-500 mt-0.5">{idea.group.name}</span>
        )}
      </div>

      {/* Done button */}
      <button
        onClick={() => onDone(idea.id)}
        className="flex-shrink-0 p-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 opacity-0 group-hover:opacity-100 active:opacity-100 active:scale-95 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </button>
    </div>
  );
}
