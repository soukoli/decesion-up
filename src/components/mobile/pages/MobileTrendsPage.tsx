'use client';

import { useState } from 'react';
import { TechTrend } from '@/types';
import { useTranslation } from '@/lib/translation';

interface MobileTrendsPageProps {
  trends: TechTrend[];
}

export function MobileTrendsPage({ trends }: MobileTrendsPageProps) {
  const [expanded, setExpanded] = useState(false);
  const { language } = useTranslation();
  
  const displayedTrends = expanded ? trends : trends.slice(0, 10);

  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm pt-4 pb-3">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          {language === 'cs' ? 'Trendy' : 'Trends'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {language === 'cs' ? 'Co je teď hot v tech světě' : 'What\'s hot in tech right now'}
        </p>
        <p className="text-xs text-amber-400/60 mt-2">
          {language === 'cs' ? 'Zdroj: Hacker News' : 'Source: Hacker News'}
        </p>
      </header>

      {/* Content */}
      <div className="pb-32 space-y-2">
        {displayedTrends.map((trend, index) => (
          <a
            key={trend.id}
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors"
          >
            <span className="text-amber-400 font-bold text-sm min-w-[1.5rem] pt-0.5">
              {index + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white line-clamp-2">
                {trend.title}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  {trend.score}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {trend.comments}
                </span>
                <span>{trend.timeAgo}</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}

        {trends.length > 10 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-3 text-sm text-amber-400 hover:text-amber-300 border border-slate-700 rounded-xl transition-colors"
          >
            {expanded 
              ? (language === 'cs' ? 'Zobrazit méně' : 'Show Less')
              : (language === 'cs' ? `Zobrazit dalších ${trends.length - 10}` : `Show ${trends.length - 10} More`)
            }
          </button>
        )}
      </div>
    </div>
  );
}
