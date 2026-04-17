'use client';

import Image from 'next/image';
import { PodcastEpisode } from '@/types';

interface PodcastCardProps {
  episode: PodcastEpisode;
}

export function PodcastCard({ episode }: PodcastCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return diffHours === 0 ? 'Just now' : `${diffHours}h ago`;
    }
    if (diffHours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-200 overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-700">
        {episode.imageUrl && !episode.imageUrl.startsWith('/') ? (
          <Image
            src={episode.imageUrl}
            alt={episode.podcastName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
            <span className="text-4xl">🎧</span>
          </div>
        )}
        {/* Category Badge */}
        <div 
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium text-slate-900"
          style={{ backgroundColor: episode.categoryColor }}
        >
          {episode.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Podcast Name */}
        <h3 className="text-sm font-semibold text-white mb-1 truncate">
          {episode.podcastName}
        </h3>
        
        {/* Episode Title */}
        <p className="text-xs text-slate-400 mb-2 line-clamp-2 min-h-[2rem]">
          {truncateText(episode.title, 60)}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {episode.duration}
          </span>
          <span>{formatDate(episode.pubDate)}</span>
        </div>

        {/* Spotify Button */}
        <a
          href={episode.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-[#1DB954] hover:bg-[#1ed760] rounded-lg text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Open in Spotify
        </a>
      </div>
    </div>
  );
}
