'use client';

import { useState, useEffect } from 'react';
import { WorldNews } from '@/types';
import { useTranslation } from '@/lib/translation';
import { useSettings, FONT_SIZE_CONFIG } from '@/lib/settings';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

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

const categoryLabelsEN: Record<string, string> = {
  world: 'World',
  europe: 'Europe',
  business: 'Business',
  science: 'Science',
  geopolitics: 'Geopolitics',
};

const categoryLabelsCZ: Record<string, string> = {
  world: 'Svět',
  europe: 'Evropa',
  business: 'Ekonomika',
  science: 'Věda',
  geopolitics: 'Geopolitika',
};

function formatTimeAgo(dateStr: string, lang: 'en' | 'cs'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (lang === 'cs') {
    if (diffMins < 60) return `před ${diffMins}m`;
    if (diffHours < 24) return `před ${diffHours}h`;
    if (diffDays === 1) return 'Včera';
    return `před ${diffDays}d`;
  }

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

interface TranslatedNews {
  title: string;
  description: string;
}

export function NewsSection({ news }: NewsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const { language, translate, isTranslating } = useTranslation();
  const { fontSize } = useSettings();
  const [translations, setTranslations] = useState<Record<string, TranslatedNews>>({});
  
  const displayedNews = expanded ? news : news.slice(0, 6);
  const categoryLabels = language === 'cs' ? categoryLabelsCZ : categoryLabelsEN;
  const fontConfig = FONT_SIZE_CONFIG[fontSize];

  // Translate news when language changes to Czech
  useEffect(() => {
    if (language === 'cs' && news.length > 0) {
      const translateNews = async () => {
        const titlesToTranslate = displayedNews
          .filter(item => !translations[item.id]?.title)
          .map(item => item.title);
        
        const descriptionsToTranslate = displayedNews
          .filter(item => !translations[item.id]?.description && item.description)
          .map(item => item.description || '');

        if (titlesToTranslate.length === 0 && descriptionsToTranslate.length === 0) {
          return;
        }

        const translatedTitles = titlesToTranslate.length > 0 
          ? await translate(titlesToTranslate) 
          : [];
        
        const translatedDescriptions = descriptionsToTranslate.length > 0 
          ? await translate(descriptionsToTranslate) 
          : [];

        const newTranslations: Record<string, TranslatedNews> = { ...translations };
        let titleIdx = 0;
        let descIdx = 0;

        displayedNews.forEach((item) => {
          if (!newTranslations[item.id]) {
            newTranslations[item.id] = { title: '', description: '' };
          }
          if (!newTranslations[item.id].title && titleIdx < translatedTitles.length) {
            newTranslations[item.id].title = translatedTitles[titleIdx++];
          }
          if (!newTranslations[item.id].description && item.description && descIdx < translatedDescriptions.length) {
            newTranslations[item.id].description = translatedDescriptions[descIdx++];
          }
        });

        setTranslations(newTranslations);
      };

      translateNews();
    }
  }, [language, news, displayedNews, translate, translations]);

  const getTitle = (item: WorldNews) => {
    if (language === 'cs' && translations[item.id]?.title) {
      return translations[item.id].title;
    }
    return item.title;
  };

  const getDescription = (item: WorldNews) => {
    if (language === 'cs' && translations[item.id]?.description) {
      return translations[item.id].description;
    }
    return item.description;
  };

  if (news.length === 0) {
    return null;
  }

  const rightContent = isTranslating ? (
    <span className="text-xs text-slate-500 flex items-center gap-1">
      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </span>
  ) : null;

  return (
    <CollapsibleSection
      title={language === 'cs' ? 'Světové zprávy' : 'World News'}
      subtitle="Reuters, BBC, Guardian"
      badge={news.length}
      rightContent={rightContent}
      defaultExpanded={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedNews.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[item.category]}`}>
                {categoryLabels[item.category]}
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {formatTimeAgo(item.publishedAt, language)}
              </span>
            </div>
            
            <h3 className={`${fontConfig.titleClass} font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-2 mb-1`}>
              {getTitle(item)}
            </h3>
            
            {item.description && (
              <p className={`${fontConfig.bodyClass} text-slate-400 line-clamp-2 mb-2`}>
                {getDescription(item)}
              </p>
            )}
            
            <span className="text-xs text-slate-600">{item.source}</span>
          </a>
        ))}
      </div>

      {news.length > 6 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-xs text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {language === 'cs' ? 'Méně' : 'Less'}
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              +{news.length - 6} {language === 'cs' ? 'více' : 'more'}
            </>
          )}
        </button>
      )}
    </CollapsibleSection>
  );
}
