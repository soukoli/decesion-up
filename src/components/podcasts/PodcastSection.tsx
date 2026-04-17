'use client';

import { useState } from 'react';
import { PodcastEpisode } from '@/types';
import { PodcastCard } from './PodcastCard';

interface PodcastSectionProps {
  episodes: PodcastEpisode[];
}

export function PodcastSection({ episodes }: PodcastSectionProps) {
  const [expanded, setExpanded] = useState(false);
  
  const mainEpisodes = episodes.slice(0, 4);
  const extraEpisodes = episodes.slice(4);
  
  const displayedEpisodes = expanded ? episodes : mainEpisodes;

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Loading podcasts...</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          Daily Podcasts
        </h2>
        <span className="text-sm text-slate-400">
          {episodes.length} shows
        </span>
      </div>

      {/* Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {displayedEpisodes.map((episode) => (
          <PodcastCard key={episode.id} episode={episode} />
        ))}
      </div>

      {/* Show More Button */}
      {extraEpisodes.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-2 text-sm text-amber-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Show Less
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show {extraEpisodes.length} More Podcasts
            </>
          )}
        </button>
      )}
    </section>
  );
}
