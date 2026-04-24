'use client';

import { TechTrend, AIResearch } from '@/types';
import { AITechSection } from '@/components/ai-tech';

interface MobileAITechPageProps {
  trends: TechTrend[];
  research: AIResearch[];
}

export function MobileAITechPage({ trends, research }: MobileAITechPageProps) {
  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area pb-32">
      <AITechSection trends={trends} research={research} />
    </div>
  );
}
