'use client';

import { useState, useEffect } from 'react';
import { AIResearch } from '@/types';
import { useTranslation } from '@/lib/translation';

interface ResearchSectionProps {
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

export function ResearchSection({ research }: ResearchSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const { language, translate, isTranslating } = useTranslation();
  const [translations, setTranslations] = useState<Record<string, TranslatedPaper>>({});
  
  const displayedResearch = expanded ? research : research.slice(0, 4);

  // Translate papers when language changes to Czech
  useEffect(() => {
    if (language === 'cs' && research.length > 0) {
      const translatePapers = async () => {
        const titlesToTranslate = displayedResearch
          .filter(paper => !translations[paper.id]?.title)
          .map(paper => paper.title);
        
        const summariesToTranslate = displayedResearch
          .filter(paper => !translations[paper.id]?.summary)
          .map(paper => paper.summary.substring(0, 400)); // Limit summary length

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

  if (research.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>{language === 'cs' ? 'Načítám AI výzkum...' : 'Loading AI research...'}</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {language === 'cs' ? 'AI Výzkum' : 'AI Research'}
          </h2>
          <p className="text-xs text-slate-500">arXiv • {language === 'cs' ? 'nejnovější články' : 'latest papers'}</p>
        </div>
        {isTranslating && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {language === 'cs' ? 'Překládám...' : 'Translating...'}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {displayedResearch.map((paper) => (
          <a
            key={paper.id}
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {paper.category}
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {formatTimeAgo(paper.publishedAt, language)}
              </span>
            </div>
            
            <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
              {getTitle(paper)}
            </h3>
            
            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
              {getSummary(paper)}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {paper.authors.slice(0, 2).join(', ')}
                {paper.authors.length > 2 ? ` +${paper.authors.length - 2}` : ''}
              </span>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {research.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {language === 'cs' ? 'Zobrazit méně' : 'Show Less'}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {language === 'cs' ? `Zobrazit dalších ${research.length - 4} článků` : `Show ${research.length - 4} More Papers`}
            </>
          )}
        </button>
      )}
    </section>
  );
}
