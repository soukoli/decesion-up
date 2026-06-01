'use client';

import { useEffect, useState, useRef } from 'react';
import { IdeaAI, Priority, PRIORITY_CONFIG } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSnackbar } from '@/components/ui/Snackbar';

type ViewFilter = 'active' | 'done' | 'all';

export function KnowledgeScreen() {
  const [ideas, setIdeas] = useState<IdeaAI[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('active');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContext, setEditContext] = useState('');
  const { showSnackbar } = useSnackbar();
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { fetchIdeas(); }, [viewFilter]);

  // Listen for new/updated ideas from IdeaSheet
  useEffect(() => {
    const handleCreated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setIdeas(prev => [detail as IdeaAI, ...prev]);
      }
    };
    const handleUpdated = () => fetchIdeas();
    const handleNavigateIdea = (e: Event) => {
      const ideaId = (e as CustomEvent).detail;
      if (ideaId) setExpandedId(ideaId);
    };

    window.addEventListener('idea-created', handleCreated);
    window.addEventListener('idea-updated', handleUpdated);
    window.addEventListener('navigate-idea', handleNavigateIdea);
    return () => {
      window.removeEventListener('idea-created', handleCreated);
      window.removeEventListener('idea-updated', handleUpdated);
      window.removeEventListener('navigate-idea', handleNavigateIdea);
    };
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const urls = viewFilter === 'all'
        ? ['/api/ideas?status=active', '/api/ideas?status=done']
        : [`/api/ideas?status=${viewFilter}`];
      const results = await Promise.all(urls.map(u => fetch(u).then(r => r.json())));
      const allIdeas = results.flatMap(r => r.ideas || []);
      setIdeas(allIdeas.sort((a: IdeaAI, b: IdeaAI) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleDone = async (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: 'done' as const } : i));
    setExpandedId(null);
    await fetch('/api/ideas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'done' }) });
  };

  const handleArchive = async (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    setExpandedId(null);
    await fetch('/api/ideas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'archived' }) });
  };

  const handleRestore = async (id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: 'active' as const } : i));
    await fetch('/api/ideas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'active' }) });
  };

  const handleDelete = (id: string) => {
    const deletedIdea = ideas.find(i => i.id === id);
    if (!deletedIdea) return;

    // Optimistic: remove from UI immediately
    setIdeas(prev => prev.filter(i => i.id !== id));
    setExpandedId(null);

    // Schedule actual delete after 5s
    const timer = setTimeout(() => {
      fetch(`/api/ideas?id=${id}`, { method: 'DELETE' });
    }, 5000);
    deleteTimerRef.current = timer;

    // Show snackbar with UNDO
    showSnackbar('Nápad smazán', () => {
      clearTimeout(timer);
      setIdeas(prev => [...prev, deletedIdea].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    });
  };

  const handleCopy = (idea: IdeaAI) => {
    const text = [idea.title, idea.context].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    showSnackbar('Zkopírováno');
  };

  const startEdit = (idea: IdeaAI) => {
    setEditingId(idea.id);
    setEditTitle(idea.title);
    setEditContext(idea.context || '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setIdeas(prev => prev.map(i => i.id === editingId ? { ...i, title: editTitle, context: editContext } : i));
    setEditingId(null);
    await fetch('/api/ideas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, title: editTitle, context: editContext }) });
  };

  // Filter
  const filtered = ideas.filter(idea => {
    if (viewFilter === 'active' && idea.status !== 'active') return false;
    if (viewFilter === 'done' && idea.status !== 'done') return false;
    if (priorityFilter !== 'all' && idea.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return idea.title.toLowerCase().includes(q) || idea.context?.toLowerCase().includes(q) || idea.ai_label?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col theme-bg">
      <PageHeader title="Knowledge" />

      {/* Filters */}
      <div className="flex-shrink-0 px-4 pb-3 space-y-2">
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
          {(['active', 'done', 'all'] as ViewFilter[]).map(v => (
            <button key={v} onClick={() => setViewFilter(v)} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${viewFilter === v ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>
              {v === 'active' ? 'Aktivní' : v === 'done' ? 'Hotovo' : 'Vše'}
            </button>
          ))}
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hledat..." className="w-full pl-10 pr-4 py-2 theme-card rounded-xl text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'red', 'yellow', 'blue', 'purple'] as (Priority | 'all')[]).map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)} className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${priorityFilter === p ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-slate-800/50 theme-text-muted border theme-border/50'}`}>
              {p === 'all' ? 'Vše' : PRIORITY_CONFIG[p].labelCz}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas list */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-3xl block mb-2">✨</span>
            <p className="theme-text-muted text-sm">{search ? 'Žádné výsledky' : 'Žádné nápady'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(idea => {
              const isExpanded = expandedId === idea.id;
              const isEditing = editingId === idea.id;
              const isDone = idea.status === 'done';
              const isProcessing = idea._processing;

              return (
                <div key={idea.id} className={`relative border rounded-xl transition-all overflow-hidden ${
                  isProcessing ? 'border-amber-500/20 bg-amber-500/5 animate-pulse' :
                  isDone ? 'bg-slate-800/10 border-slate-800/30' : 'bg-slate-800/30 theme-border/50'
                }`}>
                  {/* Header - clickable to expand */}
                  <button
                    onClick={() => !isProcessing && setExpandedId(isExpanded ? null : idea.id)}
                    className="w-full text-left p-3 flex items-start gap-3"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="w-3 h-3 mt-1.5 flex-shrink-0">
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </span>
                    ) : (
                      <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        idea.priority === 'red' ? 'bg-red-500' : idea.priority === 'yellow' ? 'bg-amber-500' : idea.priority === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] font-medium leading-snug ${
                        isProcessing ? 'theme-text-muted' : isDone ? 'theme-text-muted line-through' : 'text-white'
                      }`}>
                        {idea.title}
                      </p>
                      {idea.ai_label && !isProcessing && <span className="text-xs theme-text-muted">{idea.ai_label}</span>}
                    </div>
                    {!isProcessing && (
                      <svg className={`w-4 h-4 theme-text-muted flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t theme-border-light">
                      {isEditing ? (
                        /* Edit mode */
                        <div className="mt-3 space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 theme-bg-muted border theme-border rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50"
                            autoFocus
                          />
                          <textarea
                            value={editContext}
                            onChange={(e) => setEditContext(e.target.value)}
                            placeholder="Poznámka..."
                            className="w-full px-3 py-2 theme-bg-muted border theme-border rounded-lg text-sm text-white placeholder-[var(--text-faint)] resize-none focus:outline-none focus:border-amber-500/50 min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="px-3 py-1.5 text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-lg hover:bg-amber-500/30 transition-colors">Uložit</button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs theme-text-muted theme-bg-input border theme-border rounded-lg hover:text-white transition-colors">Zrušit</button>
                          </div>
                        </div>
                      ) : (
                        /* View mode */
                        <div className="mt-3">
                          {idea.context && (
                            <p className="text-sm theme-text-secondary leading-relaxed mb-3">{idea.context}</p>
                          )}
                          {/* Actions */}
                          <div className="flex flex-wrap gap-1.5">
                            {idea.status === 'active' && (
                              <>
                                <button onClick={() => handleDone(idea.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 active:scale-95 transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                  Done
                                </button>
                                <button onClick={() => startEdit(idea)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium theme-text-secondary theme-bg-input border theme-border rounded-lg hover:text-white active:scale-95 transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L11.828 15H9v-2.828l8.932-8.931z" /></svg>
                                  Edit
                                </button>
                                <button onClick={() => handleCopy(idea)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium theme-text-secondary theme-bg-input border theme-border rounded-lg hover:text-white active:scale-95 transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  Copy
                                </button>
                                <button onClick={() => handleArchive(idea.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium theme-text-secondary theme-bg-input border theme-border rounded-lg hover:text-white active:scale-95 transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" /></svg>
                                  Archiv
                                </button>
                                <button onClick={() => handleDelete(idea.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                  Smazat
                                </button>
                              </>
                            )}
                            {idea.status === 'done' && (
                              <>
                                <button onClick={() => handleRestore(idea.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium theme-text-secondary theme-bg-input border theme-border rounded-lg hover:text-white active:scale-95 transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                                  Obnovit
                                </button>
                                <button onClick={() => handleDelete(idea.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 active:scale-95 transition-all">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                  Smazat
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
