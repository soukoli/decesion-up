'use client';

import { SchoolSection } from '@/components/school';
import { SchoolArticle } from '@/types';

interface MobileSchoolPageProps {
  schoolData: SchoolArticle[];
  onGlobeClick?: () => void;
  conflictCount?: number;
}

export function MobileSchoolPage({ schoolData, onGlobeClick, conflictCount = 0 }: MobileSchoolPageProps) {
  return (
    <div className="bg-slate-950 px-4 py-4 pb-6">
      <SchoolSection 
        initialArticles={schoolData} 
        onGlobeClick={onGlobeClick}
        conflictCount={conflictCount}
      />
    </div>
  );
}
