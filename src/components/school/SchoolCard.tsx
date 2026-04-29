'use client';

import Image from 'next/image';
import { SchoolArticle } from '@/types';
import { useTranslation } from '@/lib/translation';

interface SchoolCardProps {
  article: SchoolArticle;
  onMarkAsRead?: (articleId: string) => void;
}

// Format relative time (freshness indicator) - reused from PodcastCard pattern
function formatRelativeTime(dateStr: string, lang: 'en' | 'cs'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (lang === 'cs') {
    if (diffMins < 60) return `před ${diffMins}m`;
    if (diffHours < 24) return `před ${diffHours}h`;
    if (diffDays === 1) return 'včera';
    if (diffDays < 7) return `před ${diffDays}d`;
    return date.toLocaleDateString('cs-CZ', { month: 'short', day: 'numeric' });
  }

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function SchoolCard({ article, onMarkAsRead }: SchoolCardProps) {
  const { language } = useTranslation();
  
  const freshness = formatRelativeTime(article.pubDate, language);
  
  // Determine freshness color
  const date = new Date(article.pubDate);
  const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  const freshnessColor = hoursAgo < 6 
    ? 'text-green-400' 
    : hoursAgo < 24 
      ? 'text-amber-400' 
      : 'text-slate-500';

  const handleClick = () => {
    // Označit jako přečtený při kliknutí
    if (onMarkAsRead) {
      onMarkAsRead(article.id);
    }
  };

  return (
    <a
      href={article.articleUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group relative ${
        article.isRead ? 'opacity-60' : ''
      }`}
    >
      {/* New indicator */}
      {article.isNew && !article.isRead && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
          <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
        </div>
      )}

      {/* Read status indicator */}
      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-700">
        {/* Read checkmark overlay */}
        {article.isRead && (
          <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center z-10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
            <span className="text-2xl">🏫</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Top row: Title + Category */}
        <div className="flex items-start gap-2 mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* New badge */}
            {article.isNew && !article.isRead && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white font-bold flex-shrink-0">
                NEW
              </span>
            )}
            <h3 className={`text-sm font-semibold group-hover:text-amber-400 transition-colors ${
              article.isRead ? 'text-slate-400 line-through' : 'text-white'
            }`} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
              {article.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span 
              className="text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
              style={{ backgroundColor: `${article.categoryColor}20`, color: article.categoryColor }}
            >
              {article.category}
            </span>
            <span className={`text-xs ${freshnessColor} whitespace-nowrap`}>
              {freshness}
            </span>
          </div>
        </div>
        
        {/* Description */}
        {article.description && (
          <p className={`text-sm line-clamp-1 mb-1 ${
            article.isRead ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {article.description}
          </p>
        )}
        
        {/* Source indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            horackova.cz
            {article.isRead && (
              <span className="text-green-400 ml-2">✓ Přečteno</span>
            )}
          </span>
        </div>
      </div>

      {/* External link icon on hover */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/0 group-hover:bg-amber-500 flex items-center justify-center transition-all ml-2">
        <svg className="w-4 h-4 text-amber-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
}
