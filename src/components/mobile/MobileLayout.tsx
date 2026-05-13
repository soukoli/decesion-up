'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-creative';

import { PodcastEpisode, TechTrend, WorldNews, GlobalHotspot, AIResearch, SchoolArticle, TransportAlert, WeatherData } from '@/types';

// Section components
import { MobileBriefingPage } from './pages/MobileBriefingPage';
import { MobileFeedPage } from './pages/MobileFeedPage';
import { MobileNotesPage } from './pages/MobileNotesPage';
import { MobileNavigation } from './MobileNavigation';
import { PullToRefresh } from '../PullToRefresh';

export interface AppData {
  podcasts: PodcastEpisode[];
  trends: TechTrend[];
  news: WorldNews[];
  czechNews: WorldNews[];
  hotspots: GlobalHotspot[];
  research: AIResearch[];
  school: SchoolArticle[];
  transport: TransportAlert[];
  weather: WeatherData | null;
}

interface MobileLayoutProps {
  data: AppData;
  onRefresh: () => void;
  refreshing: boolean;
  lastRefresh: Date | null;
}

export type SectionId = 'home' | 'feed' | 'notes';

export function MobileLayout({ data, onRefresh, refreshing, lastRefresh }: MobileLayoutProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  };

  const handleNavigate = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  return (
    <div className="h-screen bg-slate-950 overflow-hidden relative">
      {/* Main Swiper Content - 3 worlds */}
      <div className="h-full pb-20">
        <Swiper
          modules={[EffectCreative]}
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
          {/* World 1: Home / Briefing */}
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobileBriefingPage
                transport={data.transport}
                weather={data.weather}
                podcasts={data.podcasts}
                news={data.news}
                czechNews={data.czechNews}
                school={data.school}
                hotspots={data.hotspots}
              />
            </PullToRefresh>
          </SwiperSlide>

          {/* World 2: Feed (nested swipe for channels) */}
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobileFeedPage
                podcasts={data.podcasts}
                school={data.school}
                trends={data.trends}
                research={data.research}
                news={data.news}
                czechNews={data.czechNews}
                onRefresh={onRefresh}
                refreshing={refreshing}
              />
            </PullToRefresh>
          </SwiperSlide>

          {/* World 3: Notes / Ideas */}
          <SwiperSlide>
            <PullToRefresh onRefresh={onRefresh} className="h-full">
              <MobileNotesPage />
            </PullToRefresh>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Bottom Navigation - 3 icons only */}
      <MobileNavigation
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
