'use client';

import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCreative } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

import { useTranslation } from '@/lib/translation';
import { PodcastEpisode, EconomicSignal, TechTrend, WorldNews, GlobalHotspot, AIResearch, StockIndex, MarketSignal } from '@/types';

// Section components (will be simplified versions for mobile)
import { MobilePodcastsPage } from './pages/MobilePodcastsPage';
import { MobileMarketsPage } from './pages/MobileMarketsPage';
import { MobileTrendsPage } from './pages/MobileTrendsPage';
import { MobileResearchPage } from './pages/MobileResearchPage';
import { MobileNewsPage } from './pages/MobileNewsPage';
import { MobileNavigation } from './MobileNavigation';
import { GlobeModal } from './GlobeModal';

export interface AppData {
  podcasts: PodcastEpisode[];
  economic: EconomicSignal[];
  markets: MarketSignal[];
  trends: TechTrend[];
  news: WorldNews[];
  hotspots: GlobalHotspot[];
  research: AIResearch[];
  stocks: StockIndex[];
}

interface MobileLayoutProps {
  data: AppData;
  onRefresh: () => void;
  refreshing: boolean;
  lastRefresh: Date | null;
}

export type SectionId = 'podcasts' | 'markets' | 'trends' | 'research' | 'news';

const sections: { id: SectionId; label: string; labelCz: string; icon: string }[] = [
  { id: 'podcasts', label: 'Podcasts', labelCz: 'Podcasty', icon: 'mic' },
  { id: 'markets', label: 'Markets', labelCz: 'Trhy', icon: 'chart' },
  { id: 'trends', label: 'Trends', labelCz: 'Trendy', icon: 'fire' },
  { id: 'research', label: 'Research', labelCz: 'Výzkum', icon: 'brain' },
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
            <MobilePodcastsPage podcasts={data.podcasts} />
          </SwiperSlide>
          
          <SwiperSlide>
            <MobileMarketsPage markets={data.markets} />
          </SwiperSlide>
          
          <SwiperSlide>
            <MobileTrendsPage trends={data.trends} />
          </SwiperSlide>
          
          <SwiperSlide>
            <MobileResearchPage research={data.research} />
          </SwiperSlide>
          
          <SwiperSlide>
            <MobileNewsPage news={data.news} />
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
