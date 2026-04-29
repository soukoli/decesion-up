'use client';

import { SchoolSection } from '@/components/school';
import { SchoolArticle } from '@/types';

interface MobileSchoolPageProps {
  schoolData: SchoolArticle[];
}

export function MobileSchoolPage({ schoolData }: MobileSchoolPageProps) {
  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 py-4 pb-32">
      <SchoolSection initialArticles={schoolData} />
    </div>
  );
}
