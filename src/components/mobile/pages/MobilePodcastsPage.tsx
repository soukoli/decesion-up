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
    <div className="h-full overflow-y-auto bg-slate-950 px-4 py-4 pb-32">
      <PodcastSection 
        initialEpisodes={podcasts} 
        onGlobeClick={onGlobeClick}
        conflictCount={conflictCount}
      />
    </div>
  );
}
