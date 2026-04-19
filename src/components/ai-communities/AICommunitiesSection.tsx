'use client';

import { AICommunity } from '@/types';
import { AICommunityCard } from './AICommunityCard';
import { useTranslation } from '@/lib/translation';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

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
    <CollapsibleSection
      title={language === 'cs' ? 'AI Zdroje & Komunity' : 'AI Sources & Communities'}
      subtitle={language === 'cs' ? 'Nejlepší zdroje' : 'Best sources'}
      badge={communities.length}
    >
      {/* Grid - 1 column on mobile, 3 on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {communities.map((community) => (
          <AICommunityCard key={community.id} community={community} />
        ))}
      </div>
    </CollapsibleSection>
  );
}
