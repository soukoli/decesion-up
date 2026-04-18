'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/translation';

export interface SearchTrend {
  id: string;
  rank: number;
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
  source: 'google' | 'bing';
}

interface TrendingSectionProps {
  trending: SearchTrend[];
  google?: SearchTrend[];
  bing?: SearchTrend[];
  periodLabel?: string;
}

type Period = '1d' | '7d' | '30d';

const periodLabels: Record<Period, { en: string; cs: string }> = {
  '1d': { en: 'Today', cs: 'Dnes' },
  '7d': { en: 'This Week', cs: 'Tento týden' },
  '30d': { en: 'This Month', cs: 'Tento měsíc' },
};

function TrendList({ 
  trends, 
  source, 
  maxTraffic,
  language,
}: { 
  trends: SearchTrend[]; 
  source: 'google' | 'bing';
  maxTraffic: number;
  language: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const sourceLabel = source === 'google' ? 'Google Trends' : (language === 'cs' ? 'Populární témata' : 'Popular Topics');
  const sourceColor = source === 'google' ? 'text-blue-400' : 'text-emerald-400';
  const sourceIcon = source === 'google' ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ) : (
    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
  
  const sourceDescription = source === 'google' 
    ? (language === 'cs' ? 'Skutečný objem vyhledávání' : 'Real search volume')
    : (language === 'cs' ? 'Témata která lidé sledují' : 'Topics people follow');

  if (trends.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>{language === 'cs' ? 'Načítám trendy...' : 'Loading trends...'}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        {sourceIcon}
        <div className="flex-1">
          <span className={`font-semibold ${sourceColor}`}>{sourceLabel}</span>
          <p className="text-xs text-slate-500">{sourceDescription}</p>
        </div>
        <span className="text-xs text-slate-500">
          {trends.length} {language === 'cs' ? 'položek' : 'items'}
        </span>
      </div>
      
      {/* List */}
      <div className="divide-y divide-slate-700/30">
        {trends.slice(0, 10).map((trend, index) => (
          <div
            key={trend.id}
            className="group hover:bg-slate-700/20 transition-colors"
          >
            <div 
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === trend.id ? null : trend.id)}
            >
              {/* Rank */}
              <span className={`w-6 text-center font-bold text-sm ${
                index < 3 ? 'text-amber-400' : 'text-slate-500'
              }`}>
                {index + 1}
              </span>
              
              {/* Title */}
              <span className="flex-1 text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                {trend.title}
              </span>
              
              {/* Traffic */}
              {trend.traffic && (
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {trend.traffic}
                </span>
              )}
              
              {/* Traffic bar (only for Google with traffic data) */}
              {trend.trafficNumber > 0 && source === 'google' && (
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    style={{ width: `${Math.max(10, (trend.trafficNumber / maxTraffic) * 100)}%` }}
                  />
                </div>
              )}
              
              {/* Expand arrow */}
              {trend.newsItems.length > 0 && (
                <svg 
                  className={`w-4 h-4 text-slate-500 transition-transform ${expandedId === trend.id ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              
              {/* External link */}
              <a
                href={trend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-400 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            {/* Expanded content - related news */}
            {expandedId === trend.id && trend.newsItems.length > 0 && (
              <div className="px-4 pb-3 pl-12 space-y-1.5 bg-slate-800/30">
                <p className="text-xs text-slate-500 mb-2">
                  {language === 'cs' ? 'Související zprávy:' : 'Related news:'}
                </p>
                {trend.newsItems.slice(0, 2).map((news, i) => (
                  <a
                    key={i}
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-slate-400 hover:text-amber-400 transition-colors line-clamp-1"
                  >
                    • {news.title}
                    {news.source && (
                      <span className="text-slate-600 ml-1">({news.source})</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendingSection({ trending, google, bing, periodLabel }: TrendingSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1d');
  const { language } = useTranslation();
  
  // Use new format if available, fallback to legacy
  const googleTrends = google || trending.filter(t => t.source === 'google' || !t.source);
  const bingTrends = bing || [];
  
  // Calculate max traffic for scaling bars
  const maxTraffic = Math.max(
    ...googleTrends.map(t => t.trafficNumber || 0),
    1
  );

  if (googleTrends.length === 0 && bingTrends.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>{language === 'cs' ? 'Načítám vyhledávací trendy...' : 'Loading search trends...'}</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <h2 className="text-xl font-bold text-white">
            {language === 'cs' ? 'Co lidé hledají' : 'What People Are Searching'}
          </h2>
        </div>
        
        {/* Period selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {language === 'cs' ? 'Období:' : 'Period:'}
          </span>
          <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700">
            {(['1d', '7d', '30d'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedPeriod === period
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {period === '1d' ? '1D' : period === '7d' ? '7D' : '30D'}
              </button>
            ))}
          </div>
          <span className="text-xs text-amber-400/70 ml-2">
            {periodLabels[selectedPeriod][language === 'cs' ? 'cs' : 'en']}
          </span>
        </div>
      </div>
      
      {/* Info text */}
      <p className="text-xs text-slate-500 mb-4">
        {language === 'cs' 
          ? 'Google Trends zobrazuje skutečný objem vyhledávání. Populární témata ukazují nejsledovanější kategorie.'
          : 'Google Trends shows actual search volume. Popular Topics shows most followed categories.'}
      </p>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendList 
          trends={googleTrends} 
          source="google" 
          maxTraffic={maxTraffic}
          language={language}
        />
        <TrendList 
          trends={bingTrends} 
          source="bing" 
          maxTraffic={maxTraffic}
          language={language}
        />
      </div>
    </section>
  );
}

// Re-export for backward compatibility
export type TrendingTopic = SearchTrend;
