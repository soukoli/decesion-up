'use client';

import { useTranslation } from '@/lib/translation';
import { useSettings } from '@/lib/settings';

interface SectionHeaderProps {
  title: string;
  lastRefresh: Date | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  showSettings?: boolean;
}

export function SectionHeader({ 
  title, 
  lastRefresh, 
  onRefresh, 
  refreshing = false,
  showSettings = false 
}: SectionHeaderProps) {
  const { language, setLanguage } = useTranslation();
  const { openSettings } = useSettings();

  const formatLastRefresh = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return language === 'cs' ? 'právě teď' : 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h`;
  };

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left: Title */}
      <h1 className="text-3xl font-black text-white tracking-tight uppercase font-display">
        {title}
      </h1>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Last refresh time + refresh button */}
        {lastRefresh && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 rounded-lg">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className={`p-1 rounded transition-colors ${
                  refreshing ? 'animate-spin text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <span className="text-xs text-slate-500">
              {formatLastRefresh(lastRefresh)}
            </span>
          </div>
        )}

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'cs' : 'en')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            language === 'cs' 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' 
              : 'bg-slate-800/50 text-slate-300 border border-slate-700'
          }`}
        >
          {language === 'cs' ? '🇨🇿' : '🇬🇧'}
        </button>

        {/* Settings button (only on certain pages) */}
        {showSettings && (
          <button
            onClick={openSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            aria-label={language === 'cs' ? 'Nastavení' : 'Settings'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}