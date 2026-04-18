'use client';

import { useState } from 'react';
import { PodcastEpisode } from '@/types';
import { PodcastCard } from './PodcastCard';
import { useTranslation } from '@/lib/translation';

interface PodcastSectionProps {
  episodes: PodcastEpisode[];
}

type TabType = 'global' | 'czech';

export function PodcastSection({ episodes }: PodcastSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [expanded, setExpanded] = useState(false);
  const { language } = useTranslation();
  
  // Separate episodes by region
  const globalEpisodes = episodes.filter(ep => ep.region === 'global' || !ep.region);
  const czechEpisodes = episodes.filter(ep => ep.region === 'czech');
  
  // Get episodes for current tab
  const currentEpisodes = activeTab === 'global' ? globalEpisodes : czechEpisodes;
  const mainEpisodes = currentEpisodes.slice(0, 4);
  const extraEpisodes = currentEpisodes.slice(4);
  const displayedEpisodes = expanded ? currentEpisodes : mainEpisodes;

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>{language === 'cs' ? 'Načítám podcasty...' : 'Loading podcasts...'}</p>
      </div>
    );
  }

  const tabs: { id: TabType; labelEN: string; labelCS: string; count: number }[] = [
    { id: 'global', labelEN: 'Global', labelCS: 'Světové', count: globalEpisodes.length },
    { id: 'czech', labelEN: 'Czech', labelCS: 'České', count: czechEpisodes.length },
  ];

  return (
    <section className="mb-8">
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          {language === 'cs' ? 'Podcasty' : 'Podcasts'}
        </h2>
        
        {/* Tabs */}
        <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setExpanded(false);
              }}
              className={`
                flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all
                ${activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white border border-transparent'
                }
              `}
            >
              {tab.id === 'czech' && <span>🇨🇿</span>}
              {tab.id === 'global' && <span>🌍</span>}
              {language === 'cs' ? tab.labelCS : tab.labelEN}
              <span className="text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Description */}
      <p className="text-xs text-slate-500 mb-4">
        {activeTab === 'global' 
          ? (language === 'cs' 
              ? 'Nejlepší světové podcasty o technologiích, vědě a aktuálním dění.' 
              : 'Top global podcasts about technology, science, and current events.')
          : (language === 'cs'
              ? 'Populární české podcasty o byznysu, zprávách a lifestylu.'
              : 'Popular Czech podcasts about business, news, and lifestyle.')
        }
      </p>

      {/* Grid - 2 columns on mobile, 4 on desktop */}
      {displayedEpisodes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayedEpisodes.map((episode) => (
            <PodcastCard key={episode.id} episode={episode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 bg-slate-800/30 rounded-xl border border-slate-700">
          <span className="text-3xl mb-2 block">🎙️</span>
          <p className="text-sm">
            {language === 'cs' 
              ? 'Žádné podcasty k zobrazení' 
              : 'No podcasts to display'}
          </p>
        </div>
      )}

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
              {language === 'cs' ? 'Zobrazit méně' : 'Show Less'}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {language === 'cs' 
                ? `Zobrazit dalších ${extraEpisodes.length}` 
                : `Show ${extraEpisodes.length} More`}
            </>
          )}
        </button>
      )}
    </section>
  );
}
