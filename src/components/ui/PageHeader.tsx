'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  rightContent?: ReactNode;
}

export function PageHeader({ title, rightContent }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 flex-shrink-0">
      <h1 className="text-xl font-bold text-white tracking-tight uppercase">{title}</h1>
      {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
    </header>
  );
}
