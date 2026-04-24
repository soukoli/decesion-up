'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PodcastEpisode } from '@/types';
import { useTranslation } from '@/lib/translation';
import { VoiceRecorder } from './VoiceRecorder';

interface PodcastNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: PodcastEpisode;
}

interface PodcastNote {
  id: number;
  podcast_id: string;
  podcast_name: string;
  episode_title: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export function PodcastNoteModal({ isOpen, onClose, episode }: PodcastNoteModalProps) {
  const [note, setNote] = useState('');
  const [existingNotes, setExistingNotes] = useState<PodcastNote[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { language } = useTranslation();

  // Fetch existing notes for this podcast
  useEffect(() => {
    if (isOpen && episode.id) {
      fetchNotes();
    }
  }, [isOpen, episode.id]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes?podcastId=${encodeURIComponent(episode.id)}`);
      if (response.ok) {
        const data = await response.json();
        setExistingNotes(data.notes || []);
      } else if (response.status === 503) {
        // Database not configured - that's okay, notes just won't persist
        setExistingNotes([]);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!note.trim()) {
      setError(language === 'cs' ? 'Napište poznámku' : 'Please enter a note');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podcastId: episode.id,
          podcastName: episode.podcastName,
          episodeTitle: episode.title,
          note: note.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExistingNotes([data.note, ...existingNotes]);
        setNote('');
        setSuccess(language === 'cs' ? 'Poznámka uložena!' : 'Note saved!');
        setTimeout(() => setSuccess(null), 3000);
      } else if (response.status === 503) {
        setError(language === 'cs' 
          ? 'Databáze není nakonfigurována. Poznámky se nebudou ukládat.'
          : 'Database not configured. Notes will not be saved.');
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      setError(language === 'cs' ? 'Chyba při ukládání' : 'Error saving note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    try {
      const response = await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' });
      if (response.ok) {
        setExistingNotes(existingNotes.filter(n => n.id !== noteId));
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setNote(transcript);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-slate-800">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {language === 'cs' ? 'Moje poznámky' : 'My Notes'}
                </h2>
                <p className="text-sm text-slate-400 truncate mt-1">
                  {episode.podcastName}: {episode.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* New note input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  {language === 'cs' ? 'Co jsem se naučil z tohoto podcastu?' : 'What did I learn from this podcast?'}
                </label>
                
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={language === 'cs' 
                    ? 'Napište nebo nahrajte své myšlenky...'
                    : 'Write or record your thoughts...'}
                  className="w-full h-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
                
                {/* Voice recorder */}
                <div className="flex items-center gap-3">
                  <VoiceRecorder 
                    onTranscript={handleVoiceTranscript} 
                    disabled={isSaving}
                  />
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !note.trim()}
                    className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving 
                      ? (language === 'cs' ? 'Ukládám...' : 'Saving...')
                      : (language === 'cs' ? 'Uložit poznámku' : 'Save note')
                    }
                  </button>
                </div>

                {/* Error/Success messages */}
                {error && (
                  <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-400">{success}</p>
                  </div>
                )}
              </div>

              {/* Existing notes */}
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : existingNotes.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-medium text-slate-400">
                    {language === 'cs' ? 'Předchozí poznámky' : 'Previous notes'}
                  </h3>
                  {existingNotes.map((existingNote) => (
                    <div
                      key={existingNote.id}
                      className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs text-slate-500">
                          {formatDate(existingNote.created_at)}
                        </p>
                        <button
                          onClick={() => handleDelete(existingNote.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">
                        {existingNote.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer tip */}
            <div className="p-3 border-t border-slate-800 bg-slate-800/30">
              <p className="text-[10px] text-slate-600 text-center">
                {language === 'cs' 
                  ? '💡 Tip: Řekněte nahlas, co jste se naučili - pomůže vám to lépe zapamatovat!'
                  : '💡 Tip: Say what you learned out loud - it helps you remember better!'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
