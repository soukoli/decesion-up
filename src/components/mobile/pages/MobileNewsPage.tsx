'use client';

import { WorldNews } from '@/types';
import { useTranslation } from '@/lib/translation';
import { useSettings, FONT_SIZE_CONFIG } from '@/lib/settings';
import { useState, useEffect } from 'react';
import { NewsDetailDrawer } from '@/components/news/NewsDetailDrawer';

interface MobileNewsPageProps {
  news: WorldNews[];
  czechNews: WorldNews[];
  onGlobeClick?: () => void;
  conflictCount?: number;
}

interface TranslatedNews {
  title: string;
  description: string;
}

export function MobileNewsPage({ news, czechNews, onGlobeClick, conflictCount = 0 }: MobileNewsPageProps) {
  const { language, setLanguage, translate, isTranslating } = useTranslation();
  const { fontSize } = useSettings();
  const fontConfig = FONT_SIZE_CONFIG[fontSize];
  
  // Tab state: 'world' or 'czech'
  const [activeTab, setActiveTab] = useState<'world' | 'czech'>('world');
  const [translations, setTranslations] = useState<Record<string, TranslatedNews>>({});
  const [selectedArticle, setSelectedArticle] = useState<WorldNews | null>(null);
  
  // Choose current news based on active tab
  const currentNews = activeTab === 'world' ? news : czechNews;

  // Translate world news titles when language is Czech
  useEffect(() => {
    if (language === 'cs' && activeTab === 'world' && news.length > 0) {
      const translateNews = async () => {
        const untranslated = news.filter(item => !translations[item.id]?.title);
        if (untranslated.length === 0) return;

        const titles = untranslated.map(item => item.title);
        const translatedTitles = await translate(titles);

        const newTranslations: Record<string, TranslatedNews> = { ...translations };
        untranslated.forEach((item, idx) => {
          newTranslations[item.id] = {
            title: translatedTitles[idx] || item.title,
            description: translations[item.id]?.description || '',
          };
        });
        setTranslations(newTranslations);
      };
      translateNews();
    }
  }, [language, activeTab, news, translate, translations]);

  const getTitle = (item: WorldNews) => {
    if (language === 'cs' && activeTab === 'world' && translations[item.id]?.title) {
      return translations[item.id].title;
    }
    return item.title;
  };

  // Category colors for Czech news
  const czechCategoryColors: Record<string, string> = {
    domaci: 'bg-red-500/20 text-red-400',
    politika: 'bg-blue-500/20 text-blue-400', 
    ekonomika: 'bg-green-500/20 text-green-400',
    region: 'bg-purple-500/20 text-purple-400',
    kultura: 'bg-pink-500/20 text-pink-400',
  };

  const categoryColors: Record<string, string> = {
    world: 'bg-blue-500/20 text-blue-400',
    europe: 'bg-purple-500/20 text-purple-400',
    business: 'bg-green-500/20 text-green-400',
    science: 'bg-cyan-500/20 text-cyan-400',
    geopolitics: 'bg-red-500/20 text-red-400',
    ...czechCategoryColors,
  };

  return (
    <div className="bg-slate-950 px-4 py-4">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase font-display">
            {language === 'cs' ? 'Zprávy' : 'News'}
          </h1>
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'cs' : 'en')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              language === 'cs'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
            }`}
          >
            <span className="text-sm">{language === 'cs' ? '🇨🇿' : '🇬🇧'}</span>
            <span className="text-xs font-medium">{language === 'cs' ? 'CZ' : 'EN'}</span>
            {isTranslating && (
              <svg className="w-3 h-3 animate-spin ml-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {activeTab === 'world' 
            ? (language === 'cs' ? 'Nejdůležitější světové události' : 'Most important world events')
            : (language === 'cs' ? 'České a lokální zprávy' : 'Czech and local news')
          }
        </p>
        
        {/* Tab switcher */}
        <div className="flex gap-1 mt-3 bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('world')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'world'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            🌍 {language === 'cs' ? 'Svět' : 'World'}
            {news.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({news.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('czech')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'czech'
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            🇨🇿 {language === 'cs' ? 'Česko' : 'Czech'}
            {czechNews.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({czechNews.length})</span>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="pb-6 space-y-3">
        {currentNews.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">
              {language === 'cs' 
                ? (activeTab === 'world' ? 'Žádné světové zprávy' : 'Žádné české zprávy')
                : (activeTab === 'world' ? 'No world news available' : 'No Czech news available')
              }
            </p>
          </div>
        ) : (
          currentNews.map((item) => {
            // Calculate freshness for display
            const publishDate = new Date(item.publishedAt);
            const hoursAgo = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60);
            const timeAgo = hoursAgo < 1 
              ? (language === 'cs' ? 'právě teď' : 'just now')
              : hoursAgo < 24
                ? (language === 'cs' ? `před ${Math.floor(hoursAgo)}h` : `${Math.floor(hoursAgo)}h ago`)
                : (language === 'cs' ? `před ${Math.floor(hoursAgo / 24)}d` : `${Math.floor(hoursAgo / 24)}d ago`);
            
            // Freshness indicator color
            const freshnessColor = item.freshness === 'hot' 
              ? 'text-red-400' 
              : item.freshness === 'fresh'
                ? 'text-amber-400'
                : item.freshness === 'recent'
                  ? 'text-blue-400'
                  : 'text-slate-500';
            
            return (
              <button
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className="block w-full text-left p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group"
              >
                {/* Header row with source, credibility, and time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      {item.source}
                    </span>
                    {item.credibility && item.credibility > 80 && (
                      <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                        ✓ {language === 'cs' ? 'Ověřeno' : 'Verified'}
                      </span>
                    )}
                    {item.sourceType === 'public' && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                        📺 {language === 'cs' ? 'Veřejné' : 'Public'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Freshness indicator */}
                    {activeTab === 'czech' && item.freshness && (
                      <div className={`w-2 h-2 rounded-full ${
                        item.freshness === 'hot' ? 'bg-red-500 animate-pulse' :
                        item.freshness === 'fresh' ? 'bg-amber-500' :
                        item.freshness === 'recent' ? 'bg-blue-500' : 'bg-slate-500'
                      }`} />
                    )}
                    <span className={`text-xs ${freshnessColor}`}>
                      {timeAgo}
                    </span>
                  </div>
                </div>
                
                <h2 
                  className={`font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors leading-relaxed tracking-wide ${
                    fontSize === 'small' ? 'text-base' : fontSize === 'large' ? 'text-xl' : 'text-lg'
                  }`}
                >
                  {getTitle(item)}
                </h2>
                
                <p 
                  className={`text-slate-400 mb-3 leading-relaxed ${
                    fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-[15px]'
                  }`}
                >
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span 
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      categoryColors[item.category] || 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {item.category}
                  </span>
                  
                  <div className="flex items-center text-xs text-slate-500">
                    <span>{language === 'cs' ? 'Číst více' : 'Read more'}</span>
                    <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* News Detail Drawer */}
      <NewsDetailDrawer
        article={selectedArticle}
        isOpen={selectedArticle !== null}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}