'use client';

import { PodcastEpisode } from '@/types';
import { PodcastSection } from '@/components/podcasts/PodcastSection';

interface MobilePodcastsPageProps {
  podcasts: PodcastEpisode[];
  onGlobeClick?: () => void;
  conflictCount?: number;
}

export function MobilePodcastsPage({ podcasts, onGlobeClick, conflictCount = 0 }: MobilePodcastsPageProps) {
  return (
    <div className="bg-slate-950 px-4 py-4 pb-6">
      <PodcastSection 
        initialEpisodes={podcasts} 
        onGlobeClick={onGlobeClick}
        conflictCount={conflictCount}
      />
    </div>
  );
}
