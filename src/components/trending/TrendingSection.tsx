'use client';

import { useState } from 'react';

export interface SearchTrend {
  id: string;
  title: string;
  traffic: string;
  trafficNumber: number;
  url: string;
  newsItems: {
    title: string;
    url: string;
    source: string;
  }[];
  relatedQueries: string[];
  imageUrl?: string;
  pubDate: string;
}

interface TrendingSectionProps {
  trending: SearchTrend[];
}

function formatTraffic(traffic: string): string {
  return traffic.replace('+', '+ searches');
}

export function TrendingSection({ trending }: TrendingSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<SearchTrend | null>(null);
  
  const displayedTrending = expanded ? trending : trending.slice(0, 8);

  if (trending.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>Loading search trends...</p>
      </div>
    );
  }

  // Find max traffic for scaling bars
  const maxTraffic = Math.max(...trending.map(t => t.trafficNumber));

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        What People Are Searching
        <span className="text-xs text-slate-500 font-normal ml-2">Google Trends</span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {displayedTrending.map((trend, index) => (
          <div
            key={trend.id}
            className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 hover:border-amber-500/50 transition-all group cursor-pointer"
            onClick={() => setSelectedTrend(selectedTrend?.id === trend.id ? null : trend)}
          >
            {/* Rank badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                #{index + 1}
              </span>
              <span className="text-xs text-slate-500">
                {trend.traffic}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
              {trend.title}
            </h3>
            
            {/* Traffic bar */}
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all"
                style={{ width: `${Math.max(10, (trend.trafficNumber / maxTraffic) * 100)}%` }}
              />
            </div>
            
            {/* Expanded news items */}
            {selectedTrend?.id === trend.id && trend.newsItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                <p className="text-xs text-slate-400 font-medium">Related News:</p>
                {trend.newsItems.slice(0, 2).map((news, i) => (
                  <a
                    key={i}
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-slate-300 hover:text-amber-400 transition-colors line-clamp-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {news.title}
                    {news.source && (
                      <span className="text-slate-500 ml-1">— {news.source}</span>
                    )}
                  </a>
                ))}
              </div>
            )}
            
            {/* Link to Google Trends */}
            <a
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-amber-400 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Explore</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        ))}
      </div>

      {trending.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-2 text-sm text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-colors flex items-center justify-center gap-2"
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
              Show {trending.length - 8} More Trends
            </>
          )}
        </button>
      )}
    </section>
  );
}

// Re-export for backward compatibility
export type TrendingTopic = SearchTrend;
