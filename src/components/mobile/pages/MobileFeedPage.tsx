'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { useTranslation } from '@/lib/translation';
import { PodcastEpisode, TechTrend, WorldNews, AIResearch, SchoolArticle } from '@/types';

import { MobilePodcastsPage } from './MobilePodcastsPage';
import { MobileSchoolPage } from './MobileSchoolPage';
import { MobileAITechPage } from './MobileAITechPage';
import { MobileNewsPage } from './MobileNewsPage';

interface MobileFeedPageProps {
  podcasts: PodcastEpisode[];
  school: SchoolArticle[];
  trends: TechTrend[];
  research: AIResearch[];
  news: WorldNews[];
  czechNews: WorldNews[];
  onRefresh: () => void;
  refreshing: boolean;
}

const FEED_TABS = [
  { id: 'podcasts', label: 'Podcasts', labelCz: 'Podcasty' },
  { id: 'school', label: 'School', labelCz: 'Škola' },
  { id: 'aitech', label: 'AI & Tech', labelCz: 'AI & Tech' },
  { id: 'news', label: 'News', labelCz: 'Zprávy' },
] as const;

export function MobileFeedPage({ podcasts, school, trends, research, news, czechNews, onRefresh, refreshing }: MobileFeedPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const nestedSwiperRef = useRef<SwiperType | null>(null);
  const { language } = useTranslation();

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    nestedSwiperRef.current?.slideTo(index);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Top tabs */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
          {FEED_TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(index)}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === index
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {language === 'cs' ? tab.labelCz : tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nested Swiper for content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Swiper
          onSwiper={(swiper) => (nestedSwiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveTab(swiper.activeIndex)}
          nested={true}
          className="h-full"
          speed={250}
          resistance={true}
          resistanceRatio={0.65}
        >
          <SwiperSlide>
            <div className="h-full overflow-y-auto">
              <MobilePodcastsPage podcasts={podcasts} />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="h-full overflow-y-auto">
              <MobileSchoolPage schoolData={school} />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="h-full overflow-y-auto">
              <MobileAITechPage trends={trends} research={research} />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="h-full overflow-y-auto">
              <MobileNewsPage news={news} czechNews={czechNews} />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
