'use client';

import { useState, useEffect } from 'react';
import { PodcastEpisode } from '@/types';
import { PodcastCard } from './PodcastCard';
import { useTranslation } from '@/lib/translation';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { CATEGORY_COLORS, getCategories } from '@/lib/podcasts-config';

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
    'News': { en: 'News', cs: 'Zprávy' },
    'Science': { en: 'Science', cs: 'Věda' },
    'Tech': { en: 'Tech', cs: 'Tech' },
    'Business': { en: 'Business', cs: 'Byznys' },
    'Ideas': { en: 'Ideas', cs: 'Nápady' },
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-400">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">{language === 'cs' ? 'Načítám podcasty...' : 'Loading podcasts...'}</p>
      </div>
    );
  }

  if (episodes.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      title={language === 'cs' ? 'Podcasty' : 'Podcasts'}
      subtitle={`${filteredEpisodes.length} ${language === 'cs' ? 'epizod' : 'episodes'}`}
      badge={filteredEpisodes.length}
      defaultExpanded={true}
    >
      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3 border-b border-slate-800">
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
      <div className="mt-4 pt-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          {language === 'cs' 
            ? 'Klikni pro otevření v Apple Podcasts'
            : 'Click to open in Apple Podcasts'}
        </p>
      </div>
    </CollapsibleSection>
  );
}
