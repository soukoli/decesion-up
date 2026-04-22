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
  
  // Primary link is Spotify, fallback to YouTube, then web
  const primaryLink = episode.spotifyUrl || episode.youtubeUrl || episode.webUrl || '#';
  const freshness = formatRelativeTime(episode.pubDate, language);
  
  // Determine freshness color
  const date = new Date(episode.pubDate);
  const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  const freshnessColor = hoursAgo < 6 
    ? 'text-green-400' 
    : hoursAgo < 24 
      ? 'text-amber-400' 
      : 'text-slate-500';

  // Determine platform indicator
  const platform = episode.spotifyUrl ? 'Spotify' : episode.youtubeUrl ? 'YouTube' : 'Web';
  const platformColor = platform === 'Spotify' ? '#1DB954' : platform === 'YouTube' ? '#FF0000' : '#9ca3af';

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
        
        {/* Duration + Platform indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {episode.duration}
          </span>
          <span className="flex items-center gap-1" style={{ color: platformColor }}>
            {platform === 'Spotify' ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            ) : platform === 'YouTube' ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            )}
            {platform}
          </span>
          {/* Show YouTube as secondary option if available */}
          {episode.spotifyUrl && episode.youtubeUrl && (
            <a 
              href={episode.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YT
            </a>
          )}
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
