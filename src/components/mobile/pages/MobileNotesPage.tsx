'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/translation';
import { useSettings, FONT_SIZE_CONFIG } from '@/lib/settings';
import { PodcastNote } from '@/lib/notes-constants';

export function MobileNotesPage() {
  const { language } = useTranslation();
  const { fontSize } = useSettings();
  const fontConfig = FONT_SIZE_CONFIG[fontSize];

  const [notes, setNotes] = useState<PodcastNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [showNewNote, setShowNewNote] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    try {
      const url = activeCategory 
        ? `/api/notes?category=${activeCategory}` 
        : '/api/notes';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Create a new personal note
  const createNote = async () => {
    if (!newNoteText.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNoteText.trim() }),
      });
      if (res.ok) {
        setNewNoteText('');
        setShowNewNote(false);
        await fetchNotes();
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setCreating(false);
    }
  };

  // Filter notes by search query
  const filteredNotes = notes.filter(note => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.note.toLowerCase().includes(query) ||
      note.podcast_name.toLowerCase().includes(query) ||
      note.episode_title.toLowerCase().includes(query)
    );
  });

  // Sort by date (newest first)
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  // Format relative time
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return language === 'cs' ? 'právě teď' : 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { 
      month: 'short', day: 'numeric' 
    });
  };

  // Simplified podcast categories
  const PODCAST_CATEGORIES = [
    { value: 'Tech', labelCs: 'Technologie', labelEn: 'Tech' },
    { value: 'Science', labelCs: 'Věda', labelEn: 'Science' },  
    { value: 'Business', labelCs: 'Business', labelEn: 'Business' },
    { value: 'Czech', labelCs: 'České', labelEn: 'Czech' },
  ];

  // Get category label and color using podcast categories
  const getCategoryInfo = (categoryValue: string | null) => {
    const cat = PODCAST_CATEGORIES.find(c => c.value === categoryValue);
    const colors: Record<string, string> = {
      'Tech': 'bg-violet-500/20 text-violet-400',
      'Science': 'bg-blue-500/20 text-blue-400', 
      'Business': 'bg-green-500/20 text-green-400',
      'Czech': 'bg-orange-500/20 text-orange-400',
    };
    return {
      label: cat ? (language === 'cs' ? cat.labelCs : cat.labelEn) : (language === 'cs' ? 'Ostatní' : 'Other'),
      color: colors[categoryValue || 'Other'] || 'bg-slate-500/20 text-slate-400',
    };
  };

  // Delete note
  const handleDelete = async (noteId: number) => {
    try {
      const res = await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        if (expandedNoteId === noteId) setExpandedNoteId(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Copy note to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy note:', error);
    }
  };

  // Start editing note
  const startEdit = (note: PodcastNote) => {
    setEditingNoteId(note.id);
    setEditingText(note.note || '');
  };

  // Save edited note
  const handleSave = async (noteId: number) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId, note: editingText }),
      });
      
      if (res.ok) {
        setNotes(prev => prev.map(n => 
          n.id === noteId ? { ...n, note: editingText, updated_at: new Date().toISOString() } : n
        ));
        setEditingNoteId(null);
        setEditingText('');
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 py-4 pb-32">
      {/* Header */}
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            {language === 'cs' ? 'Nápady' : 'Ideas'}
          </h1>
          <button
            onClick={() => setShowNewNote(!showNewNote)}
            className={`p-2.5 rounded-xl transition-all ${
              showNewNote 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'cs' 
            ? `${sortedNotes.length} poznámek` 
            : `${sortedNotes.length} notes`}
        </p>
      </header>

      {/* New note input */}
      {showNewNote && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-xl border border-amber-500/30">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder={language === 'cs' ? 'Zapsat nápad...' : 'Write an idea...'}
            className="w-full bg-transparent text-white text-sm placeholder-slate-500 resize-none focus:outline-none min-h-[60px]"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-700/50">
            <button
              onClick={() => { setShowNewNote(false); setNewNoteText(''); }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {language === 'cs' ? 'Zrušit' : 'Cancel'}
            </button>
            <button
              onClick={createNote}
              disabled={!newNoteText.trim() || creating}
              className="px-3 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50"
            >
              {creating 
                ? (language === 'cs' ? 'Ukládám...' : 'Saving...') 
                : (language === 'cs' ? 'Uložit' : 'Save')}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-3 relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'cs' ? 'Hledat v poznámkách...' : 'Search notes...'}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter chips */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === null
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
          }`}
        >
          {language === 'cs' ? 'Vše' : 'All'}
        </button>
        {PODCAST_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(activeCategory === cat.value ? null : cat.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.value
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
            }`}
          >
            {language === 'cs' ? cat.labelCs : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Notes list */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-slate-400 text-sm">
              {searchQuery 
                ? (language === 'cs' ? 'Žádné výsledky' : 'No results found')
                : (language === 'cs' ? 'Zatím žádné poznámky' : 'No notes yet')
              }
            </p>
            <p className="text-slate-600 text-xs mt-1">
              {!searchQuery && (language === 'cs' 
                ? 'Přidej poznámku u podcastu pomocí 🎤' 
                : 'Add a note from a podcast using 🎤')}
            </p>
          </div>
        ) : (
          sortedNotes.map(note => {
            const isExpanded = expandedNoteId === note.id;
            const catInfo = getCategoryInfo(note.category);
            const hasContent = note.note && note.note.trim().length > 0;
            
            return (
              <div
                key={note.id}
                className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden transition-all"
              >
                {/* Compact card header - always visible */}
                <button
                  onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                  className="w-full text-left p-3 flex items-start gap-3"
                >
                  {/* Category dot */}
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${catInfo.color.replace('text-', 'bg-').replace('/20', '')}`} />
                  
                  <div className="flex-1 min-w-0">
                    {/* Podcast name + time */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 truncate">
                        {note.podcast_name}
                      </span>
                      <span className="text-xs text-slate-600 flex-shrink-0">
                        {formatTimeAgo(note.updated_at)}
                      </span>
                    </div>
                    
                    {/* Episode title */}
                    <p className={`text-white font-medium mt-0.5 line-clamp-1 ${fontConfig.bodyClass}`}>
                      {note.episode_title}
                    </p>
                    
                    {/* Note preview */}
                    {hasContent && !isExpanded && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                        {note.note}
                      </p>
                    )}
                    
                    {/* Category chip */}
                    {note.category && (
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                    )}
                  </div>

                  {/* Expand indicator */}
                  <svg 
                    className={`w-4 h-4 text-slate-500 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-slate-700/30">
                    {/* Full note text or edit textarea */}
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                      {editingNoteId === note.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            placeholder={language === 'cs' ? 'Upravit poznámku...' : 'Edit note...'}
                            className="w-full bg-slate-800/50 text-slate-300 text-sm border border-slate-600 rounded-lg p-2 resize-none focus:outline-none focus:border-amber-500 min-h-[80px]"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(note.id)}
                              className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors"
                            >
                              {language === 'cs' ? 'Uložit' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-slate-700/50 text-slate-400 border border-slate-600/50 rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                            >
                              {language === 'cs' ? 'Zrušit' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {hasContent ? (
                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                              {note.note}
                            </p>
                          ) : (
                            <p className="text-slate-500 text-sm italic">
                              {language === 'cs' ? 'Prázdná poznámka' : 'Empty note'}
                            </p>
                          )}
                          
                          {/* Action buttons */}
                          <div className="flex gap-2 mt-3 pt-2 border-t border-slate-800/50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(note.note || '');
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 text-slate-400 rounded text-xs font-medium hover:bg-slate-700 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              {language === 'cs' ? 'Kopírovat' : 'Copy'}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(note);
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 text-slate-400 rounded text-xs font-medium hover:bg-slate-700 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              {language === 'cs' ? 'Upravit' : 'Edit'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Meta info and delete button */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">
                        {new Date(note.created_at).toLocaleDateString(
                          language === 'cs' ? 'cs-CZ' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(language === 'cs' ? 'Smazat poznámku?' : 'Delete note?')) {
                            handleDelete(note.id);
                          }
                        }}
                        className="text-xs text-red-400/70 hover:text-red-400 px-2 py-1 rounded transition-colors"
                      >
                        {language === 'cs' ? 'Smazat' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}