'use client';

import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/effect-creative';

import { HomeScreen } from '@/components/home/HomeScreen';
import { FeedScreen } from '@/components/feed/FeedScreen';
import { KnowledgeScreen } from '@/components/knowledge/KnowledgeScreen';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { IdeaSheet } from '@/components/ui/IdeaSheet';

// Bottom nav: 3 icons only (Home, Feed, Knowledge)
const NAV_ITEMS = [
  { id: 'home', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )},
  { id: 'feed', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  )},
  { id: 'knowledge', icon: (active: boolean) => (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  )},
];

export default function AppPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const [showIdeaSheet, setShowIdeaSheet] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Listen for navigation events from child components
  useEffect(() => {
    const handler = (e: Event) => {
      const index = (e as CustomEvent).detail;
      swiperRef.current?.slideTo(index);
    };
    window.addEventListener('navigate-screen', handler);
    return () => window.removeEventListener('navigate-screen', handler);
  }, []);

  const handleNavigate = (index: number) => {
    swiperRef.current?.slideTo(index);
  };

  // Desktop: sidebar layout
  if (!isMobile) {
    return <DesktopLayout />;
  }

  // Mobile: swipe layout
  return (
    <div className="h-full relative" style={{ background: 'var(--bg-app)' }}>
      {/* Main content - 3 worlds */}
      <div className="h-full pb-24">
        <Swiper
          modules={[EffectCreative]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          effect="creative"
          creativeEffect={{
            prev: { translate: ['-100%', 0, -50], opacity: 0.6 },
            next: { translate: ['100%', 0, -50], opacity: 0.6 },
          }}
          className="h-full"
          speed={280}
          resistance={true}
          resistanceRatio={0.85}
        >
          <SwiperSlide><HomeScreen /></SwiperSlide>
          <SwiperSlide><FeedScreen /></SwiperSlide>
          <SwiperSlide><KnowledgeScreen /></SwiperSlide>
        </Swiper>
      </div>

      {/* Floating pill navigation - 3 nav icons + 1 action */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 safe-area-bottom flex justify-center pointer-events-none">
        <nav className="flex items-center gap-1.5 px-4 py-2.5 rounded-full backdrop-blur-2xl pointer-events-auto" style={{ background: 'var(--bg-nav)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(index)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-violet-400 bg-violet-500/15 scale-110'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {item.icon(isActive)}
              </button>
            );
          })}
          {/* Add idea button - visually distinct */}
          <button
            onClick={() => setShowIdeaSheet(true)}
            className="p-3 ml-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/40 hover:bg-violet-500/30 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Idea capture sheet */}
      <IdeaSheet isOpen={showIdeaSheet} onClose={() => setShowIdeaSheet(false)} />
    </div>
  );
}
