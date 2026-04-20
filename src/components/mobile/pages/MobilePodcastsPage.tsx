'use client';

import { useState } from 'react';
import { PodcastEpisode, AICommunity } from '@/types';
import { useTranslation } from '@/lib/translation';

interface MobilePodcastsPageProps {
  podcasts: PodcastEpisode[];
  aiCommunities: AICommunity[];
}

export function MobilePodcastsPage({ podcasts, aiCommunities }: MobilePodcastsPageProps) {
  const [tab, setTab] = useState<'global' | 'czech' | 'ai'>('global');
  const { language } = useTranslation();

  const globalPodcasts = podcasts.filter(p => p.region === 'global');
  const czechPodcasts = podcasts.filter(p => p.region === 'czech');

  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm pt-4 pb-3">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          {language === 'cs' ? 'Podcasty' : 'Podcasts'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {language === 'cs' ? 'Nejlepší zdroje informací' : 'Best sources of information'}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'global', label: 'Global', labelCz: 'Svět' },
            { id: 'czech', label: 'Czech', labelCz: 'Česko' },
            { id: 'ai', label: 'AI Sources', labelCz: 'AI Zdroje' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700'
              }`}
            >
              {language === 'cs' ? t.labelCz : t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="pb-32 space-y-3">
        {tab === 'global' && globalPodcasts.map((podcast) => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}
        
        {tab === 'czech' && (
          czechPodcasts.length > 0 ? czechPodcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          )) : (
            <div className="text-center py-8 text-slate-500">
              {language === 'cs' ? 'České podcasty nejsou momentálně dostupné' : 'Czech podcasts not available'}
            </div>
          )
        )}
        
        {tab === 'ai' && aiCommunities.map((community) => (
          <AICommunityCard key={community.id} community={community} />
        ))}
      </div>
    </div>
  );
}

function PodcastCard({ podcast }: { podcast: PodcastEpisode }) {
  const { language } = useTranslation();
  
  return (
    <a
      href={podcast.spotifyUrl || podcast.webUrl || podcast.appleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        {podcast.imageUrl && (
          <img 
            src={podcast.imageUrl} 
            alt="" 
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white line-clamp-2">{podcast.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{podcast.podcastName}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            {podcast.duration && <span>{podcast.duration}</span>}
            <span>{podcast.pubDate}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

function AICommunityCard({ community }: { community: AICommunity }) {
  const { language } = useTranslation();
  
  const typeIcons: Record<string, string> = {
    podcast: '🎙️',
    newsletter: '📧',
    community: '👥',
    youtube: '📺',
  };
  
  return (
    <a
      href={community.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{typeIcons[community.type] || '🔗'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">
            {language === 'cs' ? community.nameCS : community.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {language === 'cs' ? community.descriptionCS : community.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
              {community.type}
            </span>
            {community.subscribers && (
              <span className="text-[10px] text-slate-500">{community.subscribers}</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
