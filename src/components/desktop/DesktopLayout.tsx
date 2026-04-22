'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AppData, SectionId } from '@/components/mobile/MobileLayout';
import { useTranslation } from '@/lib/translation';
import { useSettings } from '@/lib/settings';
import { GlobeModal } from '@/components/mobile/GlobeModal';

// Import existing section components
import { PodcastSection } from '@/components/podcasts/PodcastSection';
import { SchoolSection } from '@/components/school';
import { TrendsSection } from '@/components/trends/TrendsSection';
import { NewsSection } from '@/components/news/NewsSection';
import { ResearchSection } from '@/components/research/ResearchSection';
import { MarketsSection } from '@/components/markets';


interface DesktopLayoutProps {
  data: AppData;
  onRefresh: () => void;
  refreshing: boolean;
  lastRefresh: Date | null;
}

type DesktopSection = 'podcasts' | 'school' | 'markets' | 'trends' | 'research' | 'news';

const sections: { id: DesktopSection; label: string; labelCz: string; icon: React.ReactNode }[] = [
  { 
    id: 'podcasts', 
    label: 'Podcasts', 
    labelCz: 'Podcasty',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    )
  },
  { 
    id: 'school', 
    label: 'Horáčkova', 
    labelCz: 'Horáčkova',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    )
  },
  { 
    id: 'markets', 
    label: 'Markets', 
    labelCz: 'Trhy',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )
  },
  { 
    id: 'trends', 
    label: 'Trends', 
    labelCz: 'Trendy',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    )
  },
  { 
    id: 'research', 
    label: 'Research', 
    labelCz: 'Výzkum',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A23.928 23.928 0 0112 21a23.93 23.93 0 01-7.935-1.287c-1.717-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    )
  },
  { 
    id: 'news', 
    label: 'News', 
    labelCz: 'Zprávy',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    )
  },
];

export function DesktopLayout({ data, onRefresh, refreshing, lastRefresh }: DesktopLayoutProps) {
  const [activeSection, setActiveSection] = useState<DesktopSection>('podcasts');
  const [showGlobe, setShowGlobe] = useState(false);
  const { language, setLanguage } = useTranslation();
  const { openSettings } = useSettings();

  const conflictCount = data.hotspots.filter(h => h.intensity >= 7).length;

  const formatLastRefresh = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return language === 'cs' ? 'právě teď' : 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h`;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'podcasts':
        return <PodcastSection initialEpisodes={data.podcasts} />;
      case 'school':
        return <SchoolSection />;
      case 'markets':
        return <MarketsSection initialMarkets={data.markets} />;
      case 'trends':
        return <TrendsSection trends={data.trends} />;
      case 'research':
        return <ResearchSection research={data.research} />;
      case 'news':
        return <NewsSection news={data.news} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 max-h-screen sticky top-0 bg-slate-900/50 border-r border-slate-800 flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="shrink-0 p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Image
              src="/images/icon.png"
              alt="DecisionUp"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-lg font-bold text-white">DecisionUp</h1>
              <p className="text-xs text-slate-400">Signal, not noise</p>
            </div>
          </div>
        </div>

        {/* Scrollable content: Navigation + Bottom section */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeSection === section.id
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {section.icon}
              <span className="font-medium">
                {language === 'cs' ? section.labelCz : section.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 p-2 border-t border-slate-800 space-y-1">
          {/* Globe button */}
          <button
            onClick={() => setShowGlobe(true)}
            className="relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span className="font-medium">{language === 'cs' ? 'Globální události' : 'Global Hotspots'}</span>
            {conflictCount > 0 && (
              <span className="absolute right-3 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                {conflictCount}
              </span>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            <span className="ml-auto text-xs text-slate-500">{formatLastRefresh(lastRefresh)}</span>
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'cs' : 'en')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              language === 'cs'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{language === 'cs' ? '🇨🇿' : '🇬🇧'}</span>
            <span className="font-medium">{language === 'cs' ? 'Čeština' : 'English'}</span>
          </button>

          {/* Settings button */}
          <button
            onClick={openSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{language === 'cs' ? 'Nastavení' : 'Settings'}</span>
          </button>
        </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <header className="mb-6">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">
              {language === 'cs' 
                ? sections.find(s => s.id === activeSection)?.labelCz 
                : sections.find(s => s.id === activeSection)?.label
              }
            </h1>
          </header>

          {/* Content */}
          {renderContent()}
        </div>
      </main>

      {/* Globe Modal */}
      <GlobeModal
        isOpen={showGlobe}
        onClose={() => setShowGlobe(false)}
        hotspots={data.hotspots}
      />
    </div>
  );
}
