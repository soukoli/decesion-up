'use client';

import { useState, useEffect } from 'react';
import { TechTrend, AIResearch } from '@/types';
import { useTranslation } from '@/lib/translation';
import { useSettings, FONT_SIZE_CONFIG } from '@/lib/settings';

interface AITechSectionProps {
  trends: TechTrend[];
  research: AIResearch[];
}

function formatTimeAgo(dateStr: string, lang: 'en' | 'cs'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (lang === 'cs') {
    if (diffDays === 0) return 'Dnes';
    if (diffDays === 1) return 'Včera';
    if (diffDays < 7) return `před ${diffDays}d`;
    return date.toLocaleDateString('cs-CZ', { month: 'short', day: 'numeric' });
  }

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface TranslatedPaper {
  title: string;
  summary: string;
}

export function AITechSection({ trends, research }: AITechSectionProps) {
  const [expandedTrends, setExpandedTrends] = useState(false);
  const [expandedResearch, setExpandedResearch] = useState(false);
  const { language, translate, isTranslating } = useTranslation();
  const { fontSize } = useSettings();
  const [translations, setTranslations] = useState<Record<string, TranslatedPaper>>({});
  
  const displayedTrends = expandedTrends ? trends : trends.slice(0, 5);
  const displayedResearch = expandedResearch ? research : research.slice(0, 3);
  const fontConfig = FONT_SIZE_CONFIG[fontSize];

  // Translate research papers when language changes to Czech
  useEffect(() => {
    if (language === 'cs' && research.length > 0) {
      const translatePapers = async () => {
        const titlesToTranslate = displayedResearch
          .filter(paper => !translations[paper.id]?.title)
          .map(paper => paper.title);
        
        const summariesToTranslate = displayedResearch
          .filter(paper => !translations[paper.id]?.summary)
          .map(paper => paper.summary.substring(0, 300));

        if (titlesToTranslate.length === 0 && summariesToTranslate.length === 0) {
          return;
        }

        const translatedTitles = titlesToTranslate.length > 0 
          ? await translate(titlesToTranslate) 
          : [];
        
        const translatedSummaries = summariesToTranslate.length > 0 
          ? await translate(summariesToTranslate) 
          : [];

        const newTranslations: Record<string, TranslatedPaper> = { ...translations };
        let titleIdx = 0;
        let summaryIdx = 0;

        displayedResearch.forEach((paper) => {
          if (!newTranslations[paper.id]) {
            newTranslations[paper.id] = { title: '', summary: '' };
          }
          if (!newTranslations[paper.id].title && titleIdx < translatedTitles.length) {
            newTranslations[paper.id].title = translatedTitles[titleIdx++];
          }
          if (!newTranslations[paper.id].summary && summaryIdx < translatedSummaries.length) {
            newTranslations[paper.id].summary = translatedSummaries[summaryIdx++];
          }
        });

        setTranslations(newTranslations);
      };

      translatePapers();
    }
  }, [language, research, displayedResearch, translate, translations]);

  const getTitle = (paper: AIResearch) => {
    if (language === 'cs' && translations[paper.id]?.title) {
      return translations[paper.id].title;
    }
    return paper.title;
  };

  const getSummary = (paper: AIResearch) => {
    if (language === 'cs' && translations[paper.id]?.summary) {
      return translations[paper.id].summary;
    }
    return paper.summary;
  };

  if (trends.length === 0 && research.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>{language === 'cs' ? 'Žádná data' : 'No data'}</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Translation indicator */}
      {isTranslating && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {language === 'cs' ? 'Překládám...' : 'Translating...'}
        </div>
      )}

      {/* Tech Trends from Hacker News */}
      {trends.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔥</span>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {language === 'cs' ? 'Tech trendy' : 'Tech Trends'}
            </h3>
            <span className="text-[10px] text-slate-600">Hacker News</span>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 divide-y divide-slate-700/50">
            {displayedTrends.map((trend, index) => (
              <a
                key={trend.id}
                href={trend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 hover:bg-slate-700/30 transition-colors group"
              >
                <span className="text-amber-400 font-bold text-sm min-w-[1.5rem]">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`${fontConfig.titleClass} text-white group-hover:text-amber-400 transition-colors line-clamp-2`}>
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
              onClick={() => setExpandedTrends(!expandedTrends)}
              className="mt-2 w-full py-2 text-xs text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {expandedTrends ? (
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
                  +{trends.length - 5} {language === 'cs' ? 'více' : 'more'}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* AI Research Papers */}
      {research.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {language === 'cs' ? 'AI výzkum' : 'AI Research'}
            </h3>
            <span className="text-[10px] text-slate-600">arXiv</span>
          </div>
          
          <div className="space-y-2">
            {displayedResearch.map((paper) => (
              <a
                key={paper.id}
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {paper.category}
                  </span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatTimeAgo(paper.publishedAt, language)}
                  </span>
                </div>
                
                <h3 className={`${fontConfig.titleClass} font-medium text-slate-200 group-hover:text-white transition-colors mb-1 line-clamp-2`}>
                  {getTitle(paper)}
                </h3>
                
                <p className={`${fontConfig.bodyClass} text-slate-400 line-clamp-2 mb-2`}>
                  {getSummary(paper)}
                </p>
                
                <span className="text-xs text-slate-600">
                  {paper.authors.slice(0, 2).join(', ')}
                  {paper.authors.length > 2 ? ` +${paper.authors.length - 2}` : ''}
                </span>
              </a>
            ))}
          </div>

          {research.length > 3 && (
            <button
              onClick={() => setExpandedResearch(!expandedResearch)}
              className="mt-2 w-full py-2 text-xs text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {expandedResearch ? (
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
                  +{research.length - 3} {language === 'cs' ? 'více' : 'more'}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          {language === 'cs' 
            ? 'Zdroje: Hacker News, arXiv. Klikněte pro detaily.'
            : 'Sources: Hacker News, arXiv. Click for details.'}
        </p>
      </div>
    </section>
  );
}
