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
import { MobileNavigation } from './MobileNavigation';
import { GlobeModal } from './GlobeModal';
import { PullToRefresh } from '../PullToRefresh';

export interface AppData {
  podcasts: PodcastEpisode[];
  markets: MarketSignal[];
  trends: TechTrend[];
  news: WorldNews[];
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

export type SectionId = 'podcasts' | 'school' | 'economy' | 'aitech' | 'news';

const sections: { id: SectionId; label: string; labelCz: string; icon: string }[] = [
  { id: 'podcasts', label: 'Podcasts', labelCz: 'Podcasty', icon: 'mic' },
  { id: 'school', label: 'Horáčkova', labelCz: 'Horáčkova', icon: 'school' },
  { id: 'economy', label: 'Economy', labelCz: 'Ekonomika', icon: 'chart' },
  { id: 'aitech', label: 'AI & Tech', labelCz: 'AI & Tech', icon: 'brain' },
  { id: 'news', label: 'News', labelCz: 'Zprávy', icon: 'news' },
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
              <MobileNewsPage news={data.news} />
            </PullToRefresh>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Bottom Navigation */}
      <MobileNavigation
        sections={sections}
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
        onGlobeClick={() => setShowGlobe(true)}
        onRefresh={onRefresh}
        refreshing={refreshing}
        conflictCount={conflictCount}
        lastRefresh={lastRefresh}
      />

      {/* Globe Modal */}
      <GlobeModal
        isOpen={showGlobe}
        onClose={() => setShowGlobe(false)}
        hotspots={data.hotspots}
      />
    </div>
  );
}
