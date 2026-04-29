'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/lib/translation';

interface VoiceRecorderProps {
  onTranscript: (text: string, isAppend?: boolean) => void;
  disabled?: boolean;
}

// Check if Speech Recognition is available
const isSpeechRecognitionAvailable = () => {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { language } = useTranslation();

  useEffect(() => {
    setIsSupported(isSpeechRecognitionAvailable());
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    // Initialize speech recognition
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language === 'cs' ? 'cs-CZ' : 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      // Append final transcript to accumulated text
      if (finalTranscript.trim()) {
        const newText = finalTranscript.trim();
        setAccumulatedTranscript(prev => {
          const updatedText = prev ? prev + ' ' + newText : newText;
          onTranscript(updatedText, true); // Signal that this should be appended
          return updatedText;
        });
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        // Restart if still recording
        try {
          recognitionRef.current?.start();
        } catch (e) {
          setIsRecording(false);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, language, accumulatedTranscript, onTranscript, isRecording]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setAccumulatedTranscript(''); // Clear accumulated transcript for new recording session
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-slate-500 text-center p-2">
        {language === 'cs' 
          ? 'Hlasové nahrávání není v tomto prohlížeči podporováno'
          : 'Voice recording not supported in this browser'}
      </div>
    );
  }

  return (
    <button
      onClick={toggleRecording}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isRecording
          ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isRecording ? (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          <span>{language === 'cs' ? 'Zastavit' : 'Stop'}</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
          <span>{language === 'cs' ? 'Nahrát hlas' : 'Record voice'}</span>
        </>
      )}
    </button>
  );
}
