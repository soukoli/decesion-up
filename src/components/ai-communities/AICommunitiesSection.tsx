'use client';

import { AICommunity } from '@/types';
import { AICommunityCard } from './AICommunityCard';
import { useTranslation } from '@/lib/translation';

interface AICommunitiesSectionProps {
  communities: AICommunity[];
}

export function AICommunitiesSection({ communities }: AICommunitiesSectionProps) {
  const { language } = useTranslation();

  if (communities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>{language === 'cs' ? 'Načítám AI komunity...' : 'Loading AI communities...'}</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          {language === 'cs' ? 'AI Diskuze & Komunity' : 'AI Discussions & Communities'}
        </h2>
        <span className="text-sm text-slate-400">
          {language === 'cs' ? 'Top 3 zdroje' : 'Top 3 sources'}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-sm text-slate-400 mb-4">
        {language === 'cs' 
          ? 'Nejlepší zdroje pro sledování AI trendů, workshopů a novinek ze světa umělé inteligence.'
          : 'Best sources for following AI trends, workshops, and news from the world of artificial intelligence.'}
      </p>

      {/* Grid - 1 column on mobile, 3 on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {communities.map((community) => (
          <AICommunityCard key={community.id} community={community} />
        ))}
      </div>
    </section>
  );
}
