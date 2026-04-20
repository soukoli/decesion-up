'use client';

import { WorldNews } from '@/types';
import { useTranslation } from '@/lib/translation';
import { useSettings, FONT_SIZE_CONFIG } from '@/lib/settings';

interface MobileNewsPageProps {
  news: WorldNews[];
}

export function MobileNewsPage({ news }: MobileNewsPageProps) {
  const { language } = useTranslation();
  const { fontSize } = useSettings();
  const fontConfig = FONT_SIZE_CONFIG[fontSize];

  const categoryColors: Record<string, string> = {
    world: 'bg-blue-500/20 text-blue-400',
    europe: 'bg-purple-500/20 text-purple-400',
    business: 'bg-green-500/20 text-green-400',
    science: 'bg-cyan-500/20 text-cyan-400',
    geopolitics: 'bg-red-500/20 text-red-400',
  };

  const categoryLabels: Record<string, { en: string; cs: string }> = {
    world: { en: 'World', cs: 'Svět' },
    europe: { en: 'Europe', cs: 'Evropa' },
    business: { en: 'Business', cs: 'Byznys' },
    science: { en: 'Science', cs: 'Věda' },
    geopolitics: { en: 'Geopolitics', cs: 'Geopolitika' },
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm pt-4 pb-3">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          {language === 'cs' ? 'Zprávy' : 'News'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {language === 'cs' ? 'Nejdůležitější světové události' : 'Most important world events'}
        </p>
      </header>

      {/* Content */}
      <div className="pb-32 space-y-3">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${categoryColors[item.category] || 'bg-slate-500/20 text-slate-400'}`}>
                {categoryLabels[item.category]?.[language === 'cs' ? 'cs' : 'en'] || item.category}
              </span>
              <span className="text-[10px] text-slate-500">{item.source}</span>
            </div>
            <h3 className={`${fontConfig.titleClass} font-semibold text-white line-clamp-2 mb-2`}>
              {item.title}
            </h3>
            <p className={`${fontConfig.bodyClass} text-slate-400 line-clamp-2`}>
              {item.description}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(item.publishedAt).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </a>
        ))}
        
        {news.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            {language === 'cs' ? 'Žádné zprávy k zobrazení' : 'No news to display'}
          </div>
        )}
      </div>
    </div>
  );
}
