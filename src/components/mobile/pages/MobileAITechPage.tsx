'use client';

import { TechTrend, AIResearch } from '@/types';
import { AITechSection } from '@/components/ai-tech';

interface MobileAITechPageProps {
  trends: TechTrend[];
  research: AIResearch[];
  onGlobeClick?: () => void;
  conflictCount?: number;
}

export function MobileAITechPage({ trends, research, onGlobeClick, conflictCount = 0 }: MobileAITechPageProps) {
  return (
    <div className="bg-slate-950 px-4 py-4 pb-6">
      <AITechSection 
        trends={trends} 
        research={research} 
        onGlobeClick={onGlobeClick}
        conflictCount={conflictCount}
      />
    </div>
  );
}
