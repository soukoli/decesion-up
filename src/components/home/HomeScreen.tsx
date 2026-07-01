'use client';

import { useEffect, useState } from 'react';
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
  const [dailyFocus, setDailyFocus] = useState('');
  const [editingFocus, setEditingFocus] = useState(false);
  const { showSnackbar } = useSnackbar();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadDailyFocus(data.user.id);
    });
    fetchIdeas();
  }, []);

  const loadDailyFocus = async (userId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('user_profile')
      .select('daily_focus, daily_focus_date')
      .eq('id', userId)
      .single();
    
    if (data?.daily_focus_date === today && data?.daily_focus) {
      setDailyFocus(data.daily_focus);
    }
  };

  const saveDailyFocus = async (text: string) => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from('user_profile').upsert({
      id: user.id,
      daily_focus: text,
      daily_focus_date: today,
    }, { onConflict: 'id' });
  };

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
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400 border-2 border-slate-700">
                {(user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
          </button>
        }
      />

      <div className="px-4">
        {/* Daily Focus */}
        <div className="mb-4">
          {editingFocus ? (
            <textarea
              value={dailyFocus}
              onChange={(e) => setDailyFocus(e.target.value)}
              onBlur={() => {
                setEditingFocus(false);
                saveDailyFocus(dailyFocus);
              }}
              placeholder="Co dnes musím splnit..."
              autoFocus
              className="w-full p-3 theme-card text-[15px] font-semibold theme-text placeholder-[var(--text-faint)] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 min-h-[60px]"
              style={{ fieldSizing: 'content' } as any}
            />
          ) : (
            <button
              onClick={() => setEditingFocus(true)}
              className="w-full text-left p-3 theme-card min-h-[48px]"
            >
              {dailyFocus ? (
                <p className="text-[15px] font-semibold theme-text whitespace-pre-wrap">{dailyFocus}</p>
              ) : (
                <p className="text-[15px] theme-text-faint">Co dnes musím splnit...</p>
              )}
            </button>
          )}
        </div>

        {/* Compact KPIs */}
        <div className="flex items-center gap-4 mb-4 px-1">
          <span className="text-xs theme-text-muted">{ideas.length} aktivních</span>
          <span className="text-xs text-red-400">{critical.length} kritických</span>
          <span className="text-xs text-green-400">{doneToday} hotovo</span>
        </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">✨</span>
          <p className="theme-text-muted text-sm">Žádné aktivní nápady</p>
          <p className="theme-text-faint text-xs mt-1">Swipni doprava na Inbox</p>
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
    yellow: 'text-violet-400 border-violet-500/30',
    blue: 'text-blue-400 border-blue-500/30',
    purple: 'text-purple-400 border-purple-500/30',
  };

  const dotMap: Record<string, string> = {
    red: 'bg-red-500',
    yellow: 'bg-violet-500',
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
        <span className="text-xs theme-text-faint">({ideas.length})</span>
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
  return (
    <button
      onClick={() => onNavigate(idea.id)}
      className="w-full text-left flex items-center gap-3 p-3 theme-card cursor-pointer active:opacity-80 transition-opacity"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] theme-text font-medium leading-snug truncate">{idea.title}</p>
        {idea.ai_label && (
          <span className="text-xs theme-text-muted">{idea.ai_label}</span>
        )}
      </div>
      <svg className="w-4 h-4 theme-text-faint flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}
