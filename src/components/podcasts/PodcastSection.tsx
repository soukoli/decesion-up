'use client';

import { useState } from 'react';
import { PodcastEpisode } from '@/types';
import { PodcastCard } from './PodcastCard';
import { useTranslation } from '@/lib/translation';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

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
    return null;
  }

  const tabs = (
    <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700">
      {(['global', 'czech'] as TabType[]).map((tabId) => (
        <button
          key={tabId}
          onClick={() => {
            setActiveTab(tabId);
            setExpanded(false);
          }}
          className={`
            flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all
            ${activeTab === tabId
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          <span className="text-xs">{tabId === 'czech' ? '🇨🇿' : '🌍'}</span>
          {tabId === 'global' 
            ? (language === 'cs' ? 'Světové' : 'Global')
            : (language === 'cs' ? 'České' : 'Czech')
          }
        </button>
      ))}
    </div>
  );

  return (
    <CollapsibleSection
      title={language === 'cs' ? 'Podcasty' : 'Podcasts'}
      subtitle={`${episodes.length} ${language === 'cs' ? 'podcastů' : 'podcasts'}`}
      badge={episodes.length}
      rightContent={tabs}
      defaultExpanded={true}
    >
      {/* Grid - 2 columns on mobile, 4 on desktop */}
      {displayedEpisodes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayedEpisodes.map((episode) => (
            <PodcastCard key={episode.id} episode={episode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-sm">
            {language === 'cs' ? 'Žádné podcasty' : 'No podcasts'}
          </p>
        </div>
      )}

      {/* Show More Button */}
      {extraEpisodes.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-xs text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {language === 'cs' ? 'Méně' : 'Less'}
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              +{extraEpisodes.length} {language === 'cs' ? 'více' : 'more'}
            </>
          )}
        </button>
      )}
    </CollapsibleSection>
  );
}
