'use client';

import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  children: ReactNode;
  defaultExpanded?: boolean;
  rightContent?: ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  badge,
  children,
  defaultExpanded = true,
  rightContent,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="mb-6">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 py-2 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Expand/Collapse icon */}
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>

          {/* Title */}
          <h2 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
            {title}
          </h2>

          {/* Badge */}
          {badge !== undefined && (
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full flex-shrink-0">
              {badge}
            </span>
          )}
        </div>

        {/* Right side content (tabs, etc.) - only show when expanded */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {isExpanded && rightContent}
          
          {/* Subtitle - show when collapsed */}
          {!isExpanded && subtitle && (
            <span className="text-xs text-slate-500 hidden sm:block">
              {subtitle}
            </span>
          )}
        </div>
      </button>

      {/* Content - collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-2">
          {children}
        </div>
      </div>
    </section>
  );
}
