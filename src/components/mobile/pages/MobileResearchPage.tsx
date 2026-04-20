'use client';

import { AIResearch } from '@/types';
import { useTranslation } from '@/lib/translation';

interface MobileResearchPageProps {
  research: AIResearch[];
}

export function MobileResearchPage({ research }: MobileResearchPageProps) {
  const { language } = useTranslation();

  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm pt-4 pb-3">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          {language === 'cs' ? 'AI Výzkum' : 'AI Research'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {language === 'cs' ? 'Nejnovější papery z arXiv' : 'Latest papers from arXiv'}
        </p>
      </header>

      {/* Content */}
      <div className="pb-32 space-y-3">
        {research.map((paper) => (
          <a
            key={paper.id}
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors"
          >
            <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-400 rounded-full mb-2">
              {paper.category}
            </span>
            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">
              {paper.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-3 mb-3">
              {paper.summary}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[60%]">
                {paper.authors.slice(0, 2).join(', ')}
                {paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
              </span>
              <span>{paper.publishedAt}</span>
            </div>
          </a>
        ))}
        
        {research.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            {language === 'cs' ? 'Žádné papery k zobrazení' : 'No papers to display'}
          </div>
        )}
      </div>
    </div>
  );
}
