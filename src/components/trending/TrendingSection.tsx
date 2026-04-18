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
  source: 'google-us' | 'google-cz' | 'google' | 'bing';
  region?: 'global' | 'czech';
}

interface TrendingSectionProps {
  trending: SearchTrend[];
  google?: SearchTrend[];
  bing?: SearchTrend[];
  global?: SearchTrend[];
  czech?: SearchTrend[];
  periodLabel?: string;
}

type TabType = 'global' | 'czech';

function TrendList({ 
  trends, 
  region,
  maxTraffic,
  language,
}: { 
  trends: SearchTrend[]; 
  region: 'global' | 'czech';
  maxTraffic: number;
  language: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (trends.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-slate-800/20 rounded-lg">
        <p>{language === 'cs' ? 'Žádné trendy k zobrazení' : 'No trends to display'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {trends.slice(0, 10).map((trend, index) => (
        <div
          key={trend.id}
          className="group"
        >
          <div 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => setExpandedId(expandedId === trend.id ? null : trend.id)}
          >
            {/* Rank */}
            <span className={`w-5 text-center font-semibold text-sm ${
              index < 3 ? 'text-amber-400' : 'text-slate-500'
            }`}>
              {index + 1}
            </span>
            
            {/* Title */}
            <span className="flex-1 text-sm text-slate-200 group-hover:text-white transition-colors truncate">
              {trend.title}
            </span>
            
            {/* Traffic */}
            {trend.traffic && (
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {trend.traffic}
              </span>
            )}
            
            {/* Traffic bar */}
            {trend.trafficNumber > 0 && (
              <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                <div 
                  className="h-full bg-amber-500/70 rounded-full"
                  style={{ width: `${Math.max(15, (trend.trafficNumber / maxTraffic) * 100)}%` }}
                />
              </div>
            )}
            
            {/* Expand arrow */}
            {trend.newsItems.length > 0 && (
              <svg 
                className={`w-3.5 h-3.5 text-slate-500 transition-transform ${expandedId === trend.id ? 'rotate-180' : ''}`}
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
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-amber-400 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          {/* Expanded content - related news */}
          {expandedId === trend.id && trend.newsItems.length > 0 && (
            <div className="ml-8 px-3 pb-2 space-y-1">
              {trend.newsItems.slice(0, 2).map((news, i) => (
                <a
                  key={i}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-slate-400 hover:text-amber-400 transition-colors truncate"
                >
                  → {news.title}
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
  );
}

export function TrendingSection({ trending, google, bing, global, czech, periodLabel }: TrendingSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const { language } = useTranslation();
  
  // Use new format if available, fallback to legacy
  const globalTrends = global || google || trending.filter(t => t.region === 'global' || !t.region);
  const czechTrends = czech || bing || [];
  
  // Get current trends based on active tab
  const currentTrends = activeTab === 'global' ? globalTrends : czechTrends;
  
  // Calculate max traffic for scaling bars
  const maxTraffic = Math.max(
    ...currentTrends.map(t => t.trafficNumber || 0),
    1
  );

  const tabs = [
    { id: 'global' as TabType, labelEN: 'Global', labelCS: 'Svět', flag: '🌍', count: globalTrends.length },
    { id: 'czech' as TabType, labelEN: 'Czech', labelCS: 'Česko', flag: '🇨🇿', count: czechTrends.length },
  ];

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {language === 'cs' ? 'Vyhledávací trendy' : 'Search Trends'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'cs' 
              ? 'Co lidé právě hledají na Google' 
              : 'What people are searching on Google right now'}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all
                ${activeTab === tab.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
                }
              `}
            >
              <span className="text-xs">{tab.flag}</span>
              {language === 'cs' ? tab.labelCS : tab.labelEN}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3">
        {/* Google logo + source info */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-xs text-slate-400">
            Google Trends • {activeTab === 'global' ? 'US' : 'CZ'} • {language === 'cs' ? 'Dnes' : 'Today'}
          </span>
          <span className="text-xs text-slate-600 ml-auto">
            {currentTrends.length} {language === 'cs' ? 'trendů' : 'trends'}
          </span>
        </div>
        
        {currentTrends.length > 0 ? (
          <TrendList 
            trends={currentTrends} 
            region={activeTab}
            maxTraffic={maxTraffic}
            language={language}
          />
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p>{language === 'cs' ? 'Načítám trendy...' : 'Loading trends...'}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Re-export for backward compatibility
export type TrendingTopic = SearchTrend;
