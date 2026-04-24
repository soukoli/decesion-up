'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { PodcastEpisode } from '@/types';
import { useTranslation } from '@/lib/translation';
import { NOTE_CATEGORIES, PodcastNote } from '@/lib/notes-constants';

interface MobilePodcastNoteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  episode: PodcastEpisode;
}

// Check if Speech Recognition is available
const isSpeechRecognitionAvailable = () => {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export function MobilePodcastNoteSheet({ isOpen, onClose, episode }: MobilePodcastNoteSheetProps) {
  const [note, setNote] = useState<PodcastNote | null>(null);
  const [noteText, setNoteText] = useState('');
  const [category, setCategory] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { language } = useTranslation();

  // Initialize speech recognition check
  useEffect(() => {
    setIsSupported(isSpeechRecognitionAvailable());
  }, []);

  // Fetch or create note when opened
  useEffect(() => {
    if (isOpen && episode.id) {
      fetchOrCreateNote();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isOpen, episode.id]);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported || !isOpen) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language === 'cs' ? 'cs-CZ' : 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      // Update live transcript
      setLiveTranscript(interimTranscript || finalTranscript);
      
      // Append final transcript to note
      if (finalTranscript.trim()) {
        setNoteText(prev => {
          const newText = prev ? prev + '\n\n' + finalTranscript.trim() : finalTranscript.trim();
          // Trigger auto-save
          triggerAutoSave(newText);
          return newText;
        });
        setLiveTranscript('');
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        try {
          recognitionRef.current?.start();
        } catch {
          setIsRecording(false);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, isOpen, language, isRecording]);

  const fetchOrCreateNote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podcastId: episode.id,
          podcastName: episode.podcastName,
          episodeTitle: episode.title,
          getOrCreate: true,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setNote(data.note);
        setNoteText(data.note.note || '');
        setCategory(data.note.category || '');
      }
    } catch (err) {
      console.error('Error fetching note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAutoSave = useCallback((text: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setSaveStatus('saving');
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (!note?.id) return;
      
      try {
        const response = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: note.id,
            note: text,
            category: category || null,
          }),
        });
        
        if (response.ok) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
        }
      } catch {
        setSaveStatus('error');
      }
    }, 1000);
  }, [note?.id, category]);

  const handleNoteChange = (newText: string) => {
    setNoteText(newText);
    triggerAutoSave(newText);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setShowCategoryPicker(false);
    if (note?.id) {
      triggerAutoSave(noteText);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setLiveTranscript('');
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  const getCategoryLabel = (value: string) => {
    const cat = NOTE_CATEGORIES.find(c => c.value === value);
    if (!cat) return value;
    return language === 'cs' ? cat.labelCs : cat.labelEn;
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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-[101] bg-slate-900 rounded-t-3xl max-h-[90vh] flex flex-col"
            style={{ touchAction: 'none' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-4 pb-3 border-b border-slate-800">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎧</span>
                  <h2 className="text-lg font-bold text-white truncate">
                    {episode.podcastName}
                  </h2>
                </div>
                <p className="text-sm text-slate-400 truncate mt-1">
                  {episode.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-2 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Category Picker */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      {language === 'cs' ? 'Téma' : 'Topic'}
                    </label>
                    <button
                      onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-left"
                    >
                      <span className={category ? 'text-white' : 'text-slate-500'}>
                        {category ? getCategoryLabel(category) : (language === 'cs' ? 'Vybrat téma...' : 'Select topic...')}
                      </span>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ${showCategoryPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Category dropdown */}
                    <AnimatePresence>
                      {showCategoryPicker && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
                        >
                          {NOTE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.value}
                              onClick={() => handleCategoryChange(cat.value)}
                              className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                                category === cat.value 
                                  ? 'bg-amber-500/20 text-amber-400' 
                                  : 'text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {language === 'cs' ? cat.labelCs : cat.labelEn}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Voice Recording */}
                  <div className="flex flex-col items-center py-4">
                    {isSupported ? (
                      <>
                        <button
                          onClick={toggleRecording}
                          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                            isRecording
                              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-500/50'
                          }`}
                        >
                          {isRecording ? (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                          ) : (
                            <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            </svg>
                          )}
                        </button>
                        <p className={`mt-3 text-sm ${isRecording ? 'text-red-400' : 'text-slate-400'}`}>
                          {isRecording 
                            ? (language === 'cs' ? 'Nahrávám... (klepni pro stop)' : 'Recording... (tap to stop)')
                            : (language === 'cs' ? 'Nahraj myšlenku' : 'Record your thought')
                          }
                        </p>
                        
                        {/* Live transcript */}
                        {liveTranscript && (
                          <div className="mt-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 max-w-full">
                            <p className="text-sm text-slate-300 italic">"{liveTranscript}"</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500">
                          {language === 'cs' 
                            ? 'Hlasové nahrávání není v tomto prohlížeči podporováno'
                            : 'Voice recording not supported in this browser'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Note Text */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      {language === 'cs' ? 'Poznámka' : 'Note'}
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={noteText}
                      onChange={(e) => handleNoteChange(e.target.value)}
                      placeholder={language === 'cs' 
                        ? 'Tvoje myšlenky k tomuto podcastu...'
                        : 'Your thoughts about this podcast...'}
                      className="w-full min-h-[150px] px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                      style={{ minHeight: noteText ? Math.max(150, noteText.split('\n').length * 24) : 150 }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer with save status */}
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm safe-area-bottom">
              <div className="flex items-center justify-center gap-2 text-sm">
                {saveStatus === 'saving' && (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-amber-400">{language === 'cs' ? 'Ukládám...' : 'Saving...'}</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">{language === 'cs' ? 'Uloženo' : 'Saved'}</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-red-400">{language === 'cs' ? 'Chyba při ukládání' : 'Error saving'}</span>
                  </>
                )}
                {saveStatus === 'idle' && (
                  <span className="text-slate-600 text-xs">
                    {language === 'cs' 
                      ? 'Změny se ukládají automaticky'
                      : 'Changes are saved automatically'}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
