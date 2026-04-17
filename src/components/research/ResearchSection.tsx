'use client';

import { useState } from 'react';
import { AIResearch } from '@/types';

interface ResearchSectionProps {
  research: AIResearch[];
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ResearchSection({ research }: ResearchSectionProps) {
  const [expanded, setExpanded] = useState(false);
  
  const displayedResearch = expanded ? research : research.slice(0, 4);

  if (research.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>Loading AI research...</p>
      </div>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <span className="text-2xl">*</span>
        AI Research
        <span className="text-xs text-slate-500 font-normal ml-2">from arXiv</span>
      </h2>

      <div className="space-y-3">
        {displayedResearch.map((paper) => (
          <a
            key={paper.id}
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {paper.category}
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {formatTimeAgo(paper.publishedAt)}
              </span>
            </div>
            
            <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
              {paper.title}
            </h3>
            
            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
              {paper.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {paper.authors.slice(0, 2).join(', ')}
                {paper.authors.length > 2 ? ` +${paper.authors.length - 2}` : ''}
              </span>
              <svg className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {research.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Show Less
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show {research.length - 4} More Papers
            </>
          )}
        </button>
      )}
    </section>
  );
}
