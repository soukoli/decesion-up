'use client';

import Image from 'next/image';
import { PodcastEpisode } from '@/types';
import { useTranslation } from '@/lib/translation';

interface PodcastCardProps {
  episode: PodcastEpisode;
}

// Format relative time (freshness indicator)
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

// Compact list item for podcast
export function PodcastCard({ episode }: PodcastCardProps) {
  const { language } = useTranslation();
  
  const primaryLink = episode.appleUrl || episode.webUrl || '#';
  const freshness = formatRelativeTime(episode.pubDate, language);
  
  // Determine freshness color
  const date = new Date(episode.pubDate);
  const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  const freshnessColor = hoursAgo < 6 
    ? 'text-green-400' 
    : hoursAgo < 24 
      ? 'text-amber-400' 
      : 'text-slate-500';

  return (
    <a
      href={primaryLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group"
    >
      {/* Podcast Image - small square */}
      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-slate-700">
        {episode.imageUrl && !episode.imageUrl.startsWith('/') ? (
          <Image
            src={episode.imageUrl}
            alt={episode.podcastName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
            <span className="text-2xl">🎧</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: Podcast name + Category + Freshness */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
            {episode.podcastName}
          </h3>
          <span 
            className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
            style={{ backgroundColor: `${episode.categoryColor}20`, color: episode.categoryColor }}
          >
            {episode.category}
          </span>
          <span className={`text-xs ${freshnessColor} flex-shrink-0 ml-auto`}>
            {freshness}
          </span>
        </div>
        
        {/* Episode title */}
        <p className="text-sm text-slate-400 line-clamp-1 mb-1">
          {episode.title}
        </p>
        
        {/* Duration + Apple Podcasts link indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {episode.duration}
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Apple Podcasts
          </span>
        </div>
      </div>

      {/* Play button on hover */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/0 group-hover:bg-amber-500 flex items-center justify-center transition-all">
        <svg className="w-5 h-5 text-amber-500 group-hover:text-white ml-0.5 transition-colors" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </a>
  );
}
