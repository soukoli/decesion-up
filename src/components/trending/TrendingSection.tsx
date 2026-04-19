'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/translation';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

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
}

type RegionType = 'global' | 'czech';

function TrendList({ 
  trends, 
  maxTraffic,
  language,
  source,
}: { 
  trends: SearchTrend[]; 
  maxTraffic: number;
  language: string;
  source: 'google' | 'bing';
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (trends.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500 text-xs">
        {language === 'cs' ? 'Žádné trendy' : 'No trends'}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {trends.slice(0, 10).map((trend, index) => (
        <div key={trend.id} className="group">
          <div 
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => setExpandedId(expandedId === trend.id ? null : trend.id)}
          >
            <span className={`w-5 text-center text-xs font-medium ${
              index < 3 ? 'text-amber-400' : 'text-slate-500'
            }`}>
              {index + 1}
            </span>
            
            <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors truncate">
              {trend.title}
            </span>
            
            {trend.traffic && (
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {trend.traffic}
              </span>
            )}
            
            {trend.trafficNumber > 0 && (
              <div className="w-10 h-1 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                <div 
                  className="h-full bg-amber-500/60 rounded-full"
                  style={{ width: `${Math.max(15, (trend.trafficNumber / maxTraffic) * 100)}%` }}
                />
              </div>
            )}
            
            <a
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-all p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          {expandedId === trend.id && trend.newsItems.length > 0 && (
            <div className="ml-7 px-2 pb-2 space-y-1">
              {trend.newsItems.slice(0, 2).map((news, i) => (
                <a
                  key={i}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-slate-500 hover:text-slate-300 transition-colors truncate"
                >
                  → {news.title}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function TrendingSection({ trending, google, bing, global, czech }: TrendingSectionProps) {
  const [activeRegion, setActiveRegion] = useState<RegionType>('global');
  const { language } = useTranslation();
  
  // Use new format if available, fallback to legacy
  const globalTrends = global || google || trending.filter(t => t.region === 'global' || !t.region);
  const czechTrends = czech || bing || [];
  
  // Get current trends based on active region
  const googleTrends = activeRegion === 'global' ? globalTrends : czechTrends;
  
  // For Bing, we don't have real data yet, so show placeholder
  const bingTrends: SearchTrend[] = [];
  
  const maxTraffic = Math.max(
    ...googleTrends.map(t => t.trafficNumber || 0),
    1
  );

  if (googleTrends.length === 0 && bingTrends.length === 0) {
    return null;
  }

  const regionTabs = (
    <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700">
      {(['global', 'czech'] as RegionType[]).map((region) => (
        <button
          key={region}
          onClick={() => setActiveRegion(region)}
          className={`
            flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all
            ${activeRegion === region
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          <span className="text-xs">{region === 'czech' ? '🇨🇿' : '🌍'}</span>
          {region === 'global' 
            ? (language === 'cs' ? 'Svět' : 'Global')
            : (language === 'cs' ? 'Česko' : 'Czech')
          }
        </button>
      ))}
    </div>
  );

  return (
    <CollapsibleSection
      title={language === 'cs' ? 'Vyhledávací trendy' : 'Search Trends'}
      subtitle={language === 'cs' ? 'Co lidé hledají' : 'What people search'}
      badge={googleTrends.length}
      rightContent={regionTabs}
      defaultExpanded={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Google Trends */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/50 bg-slate-800/30">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs font-medium text-slate-300">Google</span>
            <span className="text-xs text-slate-500">
              {activeRegion === 'global' ? 'US' : 'CZ'} • {language === 'cs' ? 'Dnes' : 'Today'}
            </span>
          </div>
          <div className="p-2">
            <TrendList 
              trends={googleTrends} 
              maxTraffic={maxTraffic}
              language={language}
              source="google"
            />
          </div>
        </div>

        {/* Microsoft Bing */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/50 bg-slate-800/30">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#00A4EF">
              <path d="M5 3v16.5l4.5 2.5 8-4.5V11l-5-2.5L5 11V3zm4.5 11.5l3.5-2v3l-3.5 2v-3z"/>
            </svg>
            <span className="text-xs font-medium text-slate-300">Microsoft Bing</span>
            <span className="text-xs text-slate-500">
              {language === 'cs' ? 'Brzy' : 'Coming soon'}
            </span>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-slate-500">
              {language === 'cs' 
                ? 'Bing Trends API není veřejně dostupné'
                : 'Bing Trends API is not publicly available'}
            </p>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}

export type TrendingTopic = SearchTrend;
