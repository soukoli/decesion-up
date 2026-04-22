'use client';

import { PodcastEpisode } from '@/types';
import { PodcastSection } from '@/components/podcasts/PodcastSection';

interface MobilePodcastsPageProps {
  podcasts: PodcastEpisode[];
}

export function MobilePodcastsPage({ podcasts }: MobilePodcastsPageProps) {
  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area pb-32">
      <PodcastSection initialEpisodes={podcasts} />
    </div>
  );
}
