'use client';

import { useState } from 'react';
import { WorldNews } from '@/types';

interface NewsSectionProps {
  news: WorldNews[];
}

const categoryColors: Record<string, string> = {
  world: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  europe: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  business: 'bg-green-500/20 text-green-300 border-green-500/30',
  science: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  geopolitics: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const categoryLabels: Record<string, string> = {
  world: 'World',
  europe: 'Europe',
  business: 'Business',
  science: 'Science',
  geopolitics: 'Geopolitics',
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export function NewsSection({ news }: NewsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  
  const displayedNews = expanded ? news : news.slice(0, 6);

  if (news.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>Loading world news...</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <span className="text-2xl">*</span>
        World News
        <span className="text-xs text-slate-500 font-normal ml-2">
          Reuters, BBC, Guardian, NPR
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedNews.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[item.category]}`}>
                {categoryLabels[item.category]}
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {formatTimeAgo(item.publishedAt)}
              </span>
            </div>
            
            <h3 className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
              {item.title}
            </h3>
            
            {item.description && (
              <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{item.source}</span>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {news.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-sm text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Show Less
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show {news.length - 6} More Stories
            </>
          )}
        </button>
      )}
    </section>
  );
}
