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
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-white">
          {language === 'cs' ? 'AI Zdroje & Komunity' : 'AI Sources & Communities'}
        </h2>
        <p className="text-xs text-slate-500">
          {language === 'cs' 
            ? 'Nejlepší zdroje pro sledování AI trendů a novinek'
            : 'Best sources for following AI trends and news'}
        </p>
      </div>

      {/* Grid - 1 column on mobile, 3 on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {communities.map((community) => (
          <AICommunityCard key={community.id} community={community} />
        ))}
      </div>
    </section>
  );
}
