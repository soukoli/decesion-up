'use client';

import { SchoolSection } from '@/components/school';

export function MobileSchoolPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area pb-32">
      <SchoolSection />
    </div>
  );
}
