'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { PodcastEpisode } from '@/types';
import { useTranslation } from '@/lib/translation';
import { NOTE_CATEGORIES, PodcastNote, suggestNoteCategoryFromPodcastName } from '@/lib/notes-constants';

interface MobilePodcastNoteSheetProps {
  isOpen: boolean;
  onClose: () => void;
  episode: PodcastEpisode;
}

// Enhanced mobile compatibility detection
const getMobileCompatibility = () => {
  if (typeof window === 'undefined') return { isSupported: false, reason: 'Server side', browser: 'unknown' };
  
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  
  // Check for Speech Recognition API
  const hasSpeechAPI = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
  let browser = 'unknown';
  if (isChrome) browser = 'chrome';
  else if (isSafari) browser = 'safari';  
  else if (isFirefox) browser = 'firefox';
  
  // Determine support
  let isSupported = false;
  let reason = '';
  
  if (isIOS) {
    isSupported = false;
    reason = 'iOS Safari doesn\'t support Web Speech API';
  } else if (isSafari) {
    isSupported = false;
    reason = 'Desktop Safari has limited speech support';
  } else if (isAndroid && isChrome && hasSpeechAPI) {
    isSupported = true;
    reason = 'Android Chrome supports speech recognition';
  } else if (isChrome && hasSpeechAPI) {
    isSupported = true; 
    reason = 'Desktop Chrome supports speech recognition';
  } else if (!hasSpeechAPI) {
    isSupported = false;
    reason = 'Web Speech API not available in this browser';
  } else {
    isSupported = false;
    reason = 'Browser compatibility unknown';
  }
  
  return {
    isSupported,
    reason,
    browser,
    isIOS,
    isAndroid,
    isMobile: isIOS || isAndroid,
    userAgent: userAgent.slice(0, 100) // Truncated for logging
  };
};

// Check if Speech Recognition is available (legacy)
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
  const [compatibility, setCompatibility] = useState<ReturnType<typeof getMobileCompatibility> | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { language } = useTranslation();

  // Initialize compatibility check
  useEffect(() => {
    const checkSupport = async () => {
      const compat = getMobileCompatibility();
      setCompatibility(compat);
      
      console.log('🎤 Voice Recording Compatibility Check:');
      console.log(`   Browser: ${compat.browser} (${compat.isMobile ? 'Mobile' : 'Desktop'})`);
      console.log(`   Supported: ${compat.isSupported}`);
      console.log(`   Reason: ${compat.reason}`);
      console.log(`   User Agent: ${compat.userAgent}`);
      
      if (compat.isSupported) {
        // Check microphone permission
        try {
          const permission = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
          if (permission) {
            setPermissionGranted(permission.state === 'granted');
            permission.onchange = () => {
              setPermissionGranted(permission.state === 'granted');
            };
          } else {
            // Fallback - assume permission needed to be requested
            setPermissionGranted(false);
          }
        } catch (err) {
          console.log('Permission API not supported, will request on first use');
          setPermissionGranted(false);
        }
      }
    };
    
    checkSupport();
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

  // Auto-focus textarea on open
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure the sheet is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const fetchOrCreateNote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes?podcastId=${episode.id}`);
      if (response.ok) {
        const existingNote = await response.json();
        if (existingNote) {
          setNote(existingNote);
          setNoteText(existingNote.content || '');
          setCategory(existingNote.category || '');
        } else {
          // Create new note
          const suggestedCategory = suggestNoteCategoryFromPodcastName(episode.title, episode.category || 'other');
          setCategory(suggestedCategory);
        }
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    if (!compatibility?.isSupported) {
      setErrorMessage(compatibility?.reason || 'Speech recognition not supported');
      return;
    }

    setErrorMessage('');
    
    try {
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just needed permission
      setPermissionGranted(true);
      
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language === 'cs' ? 'cs-CZ' : 'en-US';
      
      let finalTranscript = '';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update live transcript with current interim results
        setLiveTranscript(finalTranscript + interimTranscript);
        
        // Add final results to note text
        if (finalTranscript) {
          setNoteText(prev => {
            const newText = prev + (prev ? ' ' : '') + finalTranscript.trim();
            return newText;
          });
          finalTranscript = ''; // Reset after adding
        }
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        setLiveTranscript('');
        // Auto-restart if we were still recording (handle connection drops)
        if (recognitionRef.current && recognitionRef.current.shouldRestart) {
          setTimeout(() => startRecording(), 100);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setLiveTranscript('');
        
        let errorMsg = 'Recording error occurred';
        switch (event.error) {
          case 'not-allowed':
            errorMsg = 'Microphone access denied. Please enable microphone permissions in your browser settings.';
            setPermissionGranted(false);
            break;
          case 'no-speech':
            errorMsg = 'No speech detected. Try speaking closer to the microphone.';
            break;
          case 'audio-capture':
            errorMsg = 'No microphone found. Please check your device.';
            break;
          case 'network':
            errorMsg = 'Network error. Speech recognition requires internet connection.';
            break;
          case 'aborted':
            errorMsg = 'Recording was stopped.';
            break;
          case 'language-not-supported':
            errorMsg = `Language ${recognition.lang} is not supported.`;
            break;
          default:
            errorMsg = `Speech recognition error: ${event.error}`;
        }
        setErrorMessage(errorMsg);
      };
      
      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMessage('');
        console.log('🎤 Speech recognition started');
      };
      
      recognitionRef.current = recognition;
      recognitionRef.current.shouldRestart = true;
      recognition.start();
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      
      if (error.name === 'NotAllowedError') {
        setErrorMessage('Microphone access denied. Please enable microphone permissions and try again.');
        setPermissionGranted(false);
      } else if (error.name === 'NotFoundError') {
        setErrorMessage('No microphone found. Please check your device.');
      } else {
        setErrorMessage('Failed to start recording. Please try again.');
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.shouldRestart = false;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setLiveTranscript('');
    setErrorMessage('');
  };

  // Auto-save functionality
  const saveNote = useCallback(async (content: string, categoryValue: string) => {
    if (!episode.id || !content.trim()) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      const noteData = {
        podcastId: episode.id,
        podcastTitle: episode.title,
        content: content.trim(),
        category: categoryValue || 'general'
      };
      
      const method = note?.id ? 'PUT' : 'POST';
      const url = note?.id ? `/api/notes?id=${note.id}` : '/api/notes';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      
      if (response.ok) {
        const savedNote = await response.json();
        setNote(savedNote);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [episode.id, episode.title, note?.id]);

  // Auto-save with debounce
  useEffect(() => {
    if (noteText.trim() && category) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(noteText, category);
      }, 1000); // 1 second debounce
    }
  }, [noteText, category, saveNote]);

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    onClose();
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      handleClose();
    }
  };

  const getRecordingButtonText = () => {
    if (!compatibility?.isSupported) {
      if (compatibility?.isIOS) {
        return language === 'cs' ? '📱 Použij Safari nebo Chrome na Androidu' : '📱 Use Safari or Chrome on Android';
      }
      return language === 'cs' ? '❌ Nepodporováno' : '❌ Not Supported';
    }
    
    if (!permissionGranted) {
      return language === 'cs' ? '🎤 Povolit mikrofon' : '🎤 Enable Microphone';
    }
    
    if (isRecording) {
      return language === 'cs' ? '🔴 Ukončit nahrávání' : '🔴 Stop Recording';
    }
    
    return language === 'cs' ? '🎤 Začít nahrávat' : '🎤 Start Recording';
  };

  const getCompatibilityMessage = () => {
    if (!compatibility) return null;
    
    if (compatibility.isIOS) {
      return (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-500">⚠️</span>
            <div className="text-sm">
              <p className="text-amber-400 font-medium mb-1">
                {language === 'cs' ? 'iOS Safari nepodporuje hlasové nahrávání' : 'iOS Safari doesn\'t support voice recording'}
              </p>
              <p className="text-slate-400">
                {language === 'cs' 
                  ? 'Můžete psát poznámky ručně nebo použít Chrome na Androidu'
                  : 'You can type notes manually or use Chrome on Android'
                }
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (!compatibility.isSupported) {
      return (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-red-500">❌</span>
            <div className="text-sm">
              <p className="text-red-400 font-medium mb-1">
                {language === 'cs' ? 'Hlasové nahrávání není podporováno' : 'Voice recording not supported'}
              </p>
              <p className="text-slate-400">{compatibility.reason}</p>
              <p className="text-slate-500 text-xs mt-1">
                {language === 'cs' 
                  ? 'Doporučujeme Chrome nebo Firefox na desktopu'
                  : 'We recommend Chrome or Firefox on desktop'
                }
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            className="w-full bg-slate-900 rounded-t-3xl border-t border-slate-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-slate-600 rounded-full" />
            </div>
            
            {/* Content */}
            <div className="px-6 pb-8 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'cs' ? 'Poznámky k epizodě' : 'Episode Notes'}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2">
                  {episode.title}
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Compatibility warning */}
                  {getCompatibilityMessage()}

                  {/* Category selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {language === 'cs' ? 'Kategorie' : 'Category'}
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        {category ? NOTE_CATEGORIES.find(cat => cat.value === category)?.[language === 'cs' ? 'labelCs' : 'labelEn'] : 
                         (language === 'cs' ? 'Vyberte kategorii' : 'Select category')}
                        <svg className="w-4 h-4 float-right mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showCategoryPicker && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          {NOTE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => {
                                setCategory(cat.value);
                                setShowCategoryPicker(false);
                              }}
                              className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors"
                            >
                              {cat[language === 'cs' ? 'labelCs' : 'labelEn']}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voice recording section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-300">
                        {language === 'cs' ? 'Hlasové poznámky' : 'Voice Notes'}
                      </label>
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!compatibility?.isSupported}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                            : compatibility?.isSupported && permissionGranted
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {getRecordingButtonText()}
                      </button>
                    </div>
                    
                    {/* Live transcript */}
                    {isRecording && liveTranscript && (
                      <div className="mb-3 p-3 bg-slate-800/50 border border-amber-500/30 rounded-lg">
                        <p className="text-sm text-slate-300 mb-1">
                          {language === 'cs' ? '🎙️ Živý přepis:' : '🎙️ Live transcript:'}
                        </p>
                        <p className="text-amber-200 italic">{liveTranscript}</p>
                      </div>
                    )}
                    
                    {/* Error message */}
                    {errorMessage && (
                      <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">{errorMessage}</p>
                      </div>
                    )}
                  </div>

                  {/* Text area */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {language === 'cs' ? 'Obsah poznámky' : 'Note Content'}
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={language === 'cs' 
                        ? 'Zde napište své poznámky k této epizodě...' 
                        : 'Write your notes about this episode here...'}
                      className="w-full h-48 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  {/* Save status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {saveStatus === 'saving' && (
                        <div className="flex items-center gap-2 text-amber-400">
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">{language === 'cs' ? 'Ukládání...' : 'Saving...'}</span>
                        </div>
                      )}
                      {saveStatus === 'saved' && (
                        <div className="flex items-center gap-2 text-green-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm">{language === 'cs' ? 'Uloženo' : 'Saved'}</span>
                        </div>
                      )}
                      {saveStatus === 'error' && (
                        <div className="flex items-center gap-2 text-red-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm">{language === 'cs' ? 'Chyba při ukládání' : 'Save error'}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      {language === 'cs' ? 'Zavřít' : 'Close'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}