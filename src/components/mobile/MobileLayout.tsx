'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCreative } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

import { useTranslation } from '@/lib/translation';
import { PodcastEpisode, TechTrend, WorldNews, GlobalHotspot, AIResearch, StockIndex, MarketSignal, SchoolArticle } from '@/types';

// Section components
import { MobilePodcastsPage } from './pages/MobilePodcastsPage';
import { MobileSchoolPage } from './pages/MobileSchoolPage';
import { MobileEconomyPage } from './pages/MobileEconomyPage';
import { MobileAITechPage } from './pages/MobileAITechPage';
import { MobileNewsPage } from './pages/MobileNewsPage';
import { MobileNotesPage } from './pages/MobileNotesPage';
import { MobileNavigation } from './MobileNavigation';
import { GlobeModal } from './GlobeModal';
import { PullToRefresh } from '../PullToRefresh';

export interface AppData {
  podcasts: PodcastEpisode[];
  markets: MarketSignal[];
  trends: TechTrend[];
  news: WorldNews[];
  czechNews: WorldNews[]; // New: Czech/local news
  hotspots: GlobalHotspot[];
  research: AIResearch[];
  stocks: StockIndex[];
  school: SchoolArticle[];
}

interface MobileLayoutProps {
  data: AppData;
  onRefresh: () => void;
  refreshing: boolean;
  lastRefresh: Date | null;
}

export type SectionId = 'podcasts' | 'school' | 'economy' | 'aitech' | 'news' | 'notes';

const sections: { id: SectionId; label: string; labelCz: string; icon: string }[] = [
  { id: 'podcasts', label: 'Podcasts', labelCz: 'Podcasty', icon: 'mic' },
  { id: 'school', label: 'Horáčkova', labelCz: 'Horáčkova', icon: 'school' },
  { id: 'economy', label: 'Economy', labelCz: 'Ekonomika', icon: 'chart' },
  { id: 'aitech', label: 'AI & Tech', labelCz: 'AI & Tech', icon: 'brain' },
  { id: 'news', label: 'News', labelCz: 'Zprávy', icon: 'news' },
  { id: 'notes', label: 'Notes', labelCz: 'Poznámky', icon: 'notes' },
];

export function MobileLayout({ data, onRefresh, refreshing, lastRefresh }: MobileLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showGlobe, setShowGlobe] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const { language } = useTranslation();

  // Calculate conflicts for globe badge
  const conflictCount = data.hotspots.filter(h => h.intensity >= 7).length;

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  };

  const handleNavigate = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Main Swiper Content */}
      <div className="flex-1 overflow-hidden">
        <Swiper
          modules={[Pagination, EffectCreative]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          effect="creative"
          creativeEffect={{
            prev: {
              translate: ['-100%', 0, -100],
              opacity: 0.5,
            },
            next: {
              translate: ['100%', 0, -100],
              opacity: 0.5,
            },
          }}
          className="h-full"
          speed={300}
          resistance={true}
          resistanceRatio={0.85}
        >
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobilePodcastsPage podcasts={data.podcasts} />
            </PullToRefresh>
          </SwiperSlide>
          
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobileSchoolPage schoolData={data.school} />
            </PullToRefresh>
          </SwiperSlide>
          
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobileEconomyPage markets={data.markets} stocks={data.stocks} />
            </PullToRefresh>
          </SwiperSlide>
          
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobileAITechPage trends={data.trends} research={data.research} />
            </PullToRefresh>
          </SwiperSlide>
          
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobileNewsPage news={data.news} czechNews={data.czechNews} />
            </PullToRefresh>
          </SwiperSlide>
          
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobileNotesPage />
            </PullToRefresh>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation
        sections={sections}
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
      />

      {/* Floating Globe Button */}
      <button
        onClick={() => setShowGlobe(true)}
        className="fixed top-4 right-4 z-50 flex items-center justify-center w-12 h-12 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-full shadow-lg hover:bg-slate-800/90 transition-all"
      >
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        {conflictCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
            {conflictCount}
          </span>
        )}
      </button>

      {/* Globe Modal */}
      <GlobeModal
        isOpen={showGlobe}
        onClose={() => setShowGlobe(false)}
        hotspots={data.hotspots}
      />
    </div>
  );
}
