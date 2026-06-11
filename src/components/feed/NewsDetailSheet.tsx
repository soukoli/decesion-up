'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { WorldNews } from '@/types';

interface NewsDetailSheetProps {
  articles: WorldNews[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  translations?: Record<string, string>;
}

export function NewsDetailSheet({ articles, initialIndex, isOpen, onClose, translations }: NewsDetailSheetProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const getTitle = (article: WorldNews) => translations?.[article.id] || article.title;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: 'var(--bg-app)' }}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between h-14 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-sm theme-text-muted">{currentIndex + 1} / {articles.length}</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg theme-text-muted hover:theme-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Swipeable content */}
          <div className="flex-1 min-h-0">
            <Swiper
              initialSlide={initialIndex}
              onSlideChange={(swiper: SwiperType) => setCurrentIndex(swiper.activeIndex)}
              className="h-full"
              speed={250}
            >
              {articles.map((article) => (
                <SwiperSlide key={article.id}>
                  <div className="h-full overflow-y-auto overscroll-contain px-5 py-5 pb-24">
                    {/* Image */}
                    {article.imageUrl && (
                      <img src={article.imageUrl} alt="" className="w-full h-48 object-cover rounded-xl mb-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}

                    {/* Source + time */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium theme-text-muted uppercase tracking-wider">{article.source}</span>
                      <span className="text-xs theme-text-faint">
                        {new Date(article.publishedAt).toLocaleString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl font-bold theme-text leading-snug mb-4">
                      {getTitle(article)}
                    </h1>

                    {/* Description / Content */}
                    {article.description && (
                      <div className="text-base theme-text-secondary leading-relaxed whitespace-pre-line">
                        {article.description}
                      </div>
                    )}

                    {/* Source link */}
                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Otevřít originál na {article.source}
                      </a>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
