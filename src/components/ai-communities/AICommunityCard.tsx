'use client';

import { AICommunity } from '@/types';
import { useTranslation } from '@/lib/translation';

interface AICommunityCardProps {
  community: AICommunity;
}

export function AICommunityCard({ community }: AICommunityCardProps) {
  const { language } = useTranslation();
  
  const name = language === 'cs' ? community.nameCS : community.name;
  const description = language === 'cs' ? community.descriptionCS : community.description;
  const frequency = language === 'cs' ? community.frequencyCS : community.frequency;
  const topics = language === 'cs' ? community.topicsCS : community.topics;
  
  const getTypeIcon = () => {
    switch (community.type) {
      case 'podcast':
        return '🎙️';
      case 'youtube':
        return '📺';
      case 'newsletter':
        return '📧';
      case 'community':
        return '👥';
      default:
        return '🤖';
    }
  };
  
  const getTypeLabel = () => {
    if (language === 'cs') {
      switch (community.type) {
        case 'podcast': return 'Podcast';
        case 'youtube': return 'YouTube';
        case 'newsletter': return 'Newsletter';
        case 'community': return 'Komunita';
        default: return community.type;
      }
    }
    return community.type.charAt(0).toUpperCase() + community.type.slice(1);
  };
  
  const getLanguageFlag = () => {
    switch (community.language) {
      case 'cs': return '🇨🇿';
      case 'en': return '🇬🇧';
      case 'both': return '🌐';
    }
  };

  return (
    <a
      href={community.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        {/* Icon/Image */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
          {getTypeIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
              {name}
            </h3>
            <span className="text-sm">{getLanguageFlag()}</span>
          </div>
          
          {/* Meta info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-700/50">
              {getTypeLabel()}
            </span>
            {frequency && (
              <span className="text-slate-500">• {frequency}</span>
            )}
            {community.subscribers && (
              <span className="text-slate-500">• {community.subscribers}</span>
            )}
          </div>
          
          {/* Author */}
          {community.author && (
            <p className="text-xs text-amber-400/80 mb-2">
              {language === 'cs' ? 'Autor' : 'By'}: {community.author}
            </p>
          )}
          
          {/* Description */}
          <p className="text-sm text-slate-300 line-clamp-2 mb-3">
            {description}
          </p>
          
          {/* Topics */}
          <div className="flex flex-wrap gap-1.5">
            {topics.slice(0, 3).map((topic, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
        
        {/* External link icon */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </a>
  );
}
