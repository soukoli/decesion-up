'use client';

import Image from 'next/image';
import { PodcastEpisode } from '@/types';
import { useTranslation } from '@/lib/translation';

interface PodcastCardProps {
  episode: PodcastEpisode;
}

export function PodcastCard({ episode }: PodcastCardProps) {
  const { language } = useTranslation();
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (language === 'cs') {
      if (diffHours < 24) {
        return diffHours === 0 ? 'Právě teď' : `Před ${diffHours}h`;
      }
      if (diffHours < 48) {
        return 'Včera';
      }
      return date.toLocaleDateString('cs-CZ', { month: 'short', day: 'numeric' });
    }
    
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

  // Determine the best link to use
  const primaryLink = episode.spotifyUrl || episode.appleUrl || episode.webUrl || '#';

  return (
    <a
      href={primaryLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 overflow-hidden group"
    >
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
        
        {/* Language flag for Czech podcasts */}
        {episode.region === 'czech' && (
          <div className="absolute top-2 right-2 text-sm">
            🇨🇿
          </div>
        )}
        
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Podcast Name */}
        <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors mb-1 truncate">
          {episode.podcastName}
        </h3>
        
        {/* Episode Title */}
        <p className="text-xs text-slate-400 mb-2 line-clamp-2 min-h-[2rem]">
          {truncateText(episode.title, 60)}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {episode.duration}
          </span>
          <span>{formatDate(episode.pubDate)}</span>
        </div>
      </div>
    </a>
  );
}
