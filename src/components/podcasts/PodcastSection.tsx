'use client';

import { useState, useEffect } from 'react';
import { PodcastEpisode } from '@/types';
import { PodcastCard } from './PodcastCard';
import { useTranslation } from '@/lib/translation';
import { CATEGORY_COLORS, getCategories } from '@/lib/podcasts-config';
import { PodcastCardSkeleton } from '../Skeleton';

interface PodcastSectionProps {
  initialEpisodes?: PodcastEpisode[];
}

type CategoryFilter = ReturnType<typeof getCategories>[number];

export function PodcastSection({ initialEpisodes = [] }: PodcastSectionProps) {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>(initialEpisodes);
  const [loading, setLoading] = useState(initialEpisodes.length === 0);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const { language } = useTranslation();

  useEffect(() => {
    if (initialEpisodes.length === 0) {
      fetchPodcasts();
    }
  }, []);

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/podcasts');
      if (response.ok) {
        const data = await response.json();
        setEpisodes(data.podcasts || []);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter by category
  const filteredEpisodes = activeCategory === 'All' 
    ? episodes 
    : episodes.filter(ep => ep.category === activeCategory);

  // Category labels for UI
  const categoryLabels: Record<CategoryFilter, { en: string; cs: string }> = {
    'All': { en: 'All', cs: 'Vše' },
    'Tech': { en: 'Tech & AI', cs: 'Tech & AI' },
    'Science': { en: 'Science', cs: 'Věda' },
    'Business': { en: 'Business', cs: 'Byznys' },
    'Czech': { en: 'Czech', cs: 'České' },
  };

  if (loading) {
    return (
      <section className="space-y-4">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-slate-700/50 rounded-lg w-32 animate-pulse"></div>
          <div className="h-4 bg-slate-700/50 rounded-lg w-48 animate-pulse"></div>
        </div>
        
        {/* Filter tabs skeleton */}
        <div className="flex gap-2 pb-3 border-b border-slate-800">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-8 w-16 bg-slate-700/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        {/* Podcast cards skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <PodcastCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (episodes.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-800">
        {getCategories().map((category) => {
          const isActive = activeCategory === category;
          const color = category === 'All' ? '#9ca3af' : CATEGORY_COLORS[category];
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              style={isActive ? { 
                backgroundColor: `${color}20`, 
                color: color,
                border: `1px solid ${color}50`
              } : { border: '1px solid transparent' }}
            >
              {categoryLabels[category][language]}
              {category !== 'All' && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  ({episodes.filter(e => e.category === category).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compact list layout */}
      {filteredEpisodes.length > 0 ? (
        <div className="space-y-2">
          {filteredEpisodes.map((episode) => (
            <PodcastCard key={episode.id} episode={episode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-sm">
            {language === 'cs' ? 'Žádné podcasty v této kategorii' : 'No podcasts in this category'}
          </p>
        </div>
      )}

      {/* Footer with last updated info */}
      <div className="pt-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          {language === 'cs' 
            ? 'Klikni pro otevření ve Spotify'
            : 'Click to open in Spotify'}
        </p>
      </div>
    </section>
  );
}
