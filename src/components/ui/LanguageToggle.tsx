'use client';

import { useTranslation } from '@/lib/translation';

interface LanguageToggleProps {
  variant?: 'header' | 'floating';
  visible?: boolean;
}

export function LanguageToggle({ variant = 'header' }: LanguageToggleProps) {
  const { language, setLanguage, isTranslating } = useTranslation();

  const isFloating = variant === 'floating';

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'cs' : 'en')}
      disabled={isTranslating}
      className={`
        flex items-center justify-center gap-1.5 font-medium
        transition-all border
        ${isFloating 
          ? 'w-12 h-12 rounded-full text-sm shadow-lg shadow-black/30' 
          : 'px-2.5 py-1.5 rounded-lg text-xs'
        }
        ${language === 'cs' 
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
          : 'bg-slate-800/90 text-slate-300 border-slate-600 hover:border-amber-500/50 hover:text-amber-400'
        }
        ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        ${isFloating ? 'backdrop-blur-sm' : ''}
      `}
      title={language === 'en' ? 'Přeložit do češtiny' : 'Switch to English'}
    >
      {isTranslating ? (
        <svg className={`${isFloating ? 'w-5 h-5' : 'w-4 h-4'} animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : isFloating ? (
        // Floating: show current language flag (click to switch)
        <span className="text-lg">{language === 'cs' ? '🇨🇿' : '🇬🇧'}</span>
      ) : (
        <>
          {/* Globe/Language icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <span className="font-semibold">{language === 'cs' ? 'CZ' : 'EN'}</span>
        </>
      )}
    </button>
  );
}
