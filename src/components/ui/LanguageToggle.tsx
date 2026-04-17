'use client';

import { useTranslation } from '@/lib/translation';

export function LanguageToggle() {
  const { language, setLanguage, isTranslating } = useTranslation();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'cs' : 'en')}
      disabled={isTranslating}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
        transition-all border
        ${language === 'cs' 
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-amber-500/50 hover:text-amber-400'
        }
        ${isTranslating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
      `}
      title={language === 'en' ? 'Přeložit do češtiny' : 'Switch to English'}
    >
      {isTranslating ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )}
      <span>{language === 'en' ? 'CZ' : 'EN'}</span>
    </button>
  );
}
