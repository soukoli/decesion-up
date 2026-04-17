'use client';

import { useState } from 'react';
import { TechTrend } from '@/types';

interface TrendsSectionProps {
  trends: TechTrend[];
}

export function TrendsSection({ trends }: TrendsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  
  const displayedTrends = expanded ? trends : trends.slice(0, 5);

  if (trends.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>Loading tech trends...</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <span className="text-2xl">🔥</span>
        Tech Trends
        <span className="text-xs text-slate-500 font-normal ml-2">from Hacker News</span>
      </h2>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 divide-y divide-slate-700">
        {displayedTrends.map((trend, index) => (
          <a
            key={trend.id}
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 hover:bg-slate-700/50 transition-colors group"
          >
            <span className="text-amber-400 font-bold text-sm min-w-[1.5rem]">
              {index + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                {trend.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
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
            <svg className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>

      {trends.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-sm text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? 'Show Less' : `Show ${trends.length - 5} More`}
        </button>
      )}
    </section>
  );
}
