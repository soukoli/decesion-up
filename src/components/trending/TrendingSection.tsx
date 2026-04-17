'use client';

import { useState } from 'react';

export interface TrendingTopic {
  id: string;
  title: string;
  views: number;
  rank: number;
  url: string;
  category?: string;
}

interface TrendingSectionProps {
  trending: TrendingTopic[];
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
}

const categoryColors: Record<string, string> = {
  'Entertainment': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Politics': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Sports': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Conflict': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Disaster': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Technology': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export function TrendingSection({ trending }: TrendingSectionProps) {
  const [expanded, setExpanded] = useState(false);
  
  const displayedTrending = expanded ? trending : trending.slice(0, 10);

  if (trending.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>Loading trending topics...</p>
      </div>
    );
  }

  // Find max views for scaling bars
  const maxViews = Math.max(...trending.map(t => t.views));

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <span className="text-2xl">*</span>
        What the World is Searching
        <span className="text-xs text-slate-500 font-normal ml-2">Wikipedia top views</span>
      </h2>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        {displayedTrending.map((topic, index) => (
          <a
            key={topic.id}
            href={topic.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 hover:bg-slate-700/50 transition-colors group border-b border-slate-700/50 last:border-b-0"
          >
            {/* Rank */}
            <span className="text-lg font-bold text-amber-400 w-8 text-center">
              {topic.rank}
            </span>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors truncate">
                  {topic.title}
                </h3>
                {topic.category && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full border ${categoryColors[topic.category] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                    {topic.category}
                  </span>
                )}
              </div>
              
              {/* View bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all"
                    style={{ width: `${(topic.views / maxViews) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatViews(topic.views)}
                </span>
              </div>
            </div>
            
            {/* Arrow */}
            <svg className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>

      {trending.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-sm text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? 'Show Less' : `Show ${trending.length - 10} More`}
        </button>
      )}
    </section>
  );
}
