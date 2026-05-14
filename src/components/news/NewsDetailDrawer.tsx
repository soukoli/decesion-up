'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorldNews } from '@/types';
import { useTranslation } from '@/lib/translation';

interface NewsDetailDrawerProps {
  article: WorldNews | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string, lang: 'en' | 'cs'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'cs' ? 'cs-CZ' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NewsDetailDrawer({ article, isOpen, onClose }: NewsDetailDrawerProps) {
  const { language, translate, isTranslating } = useTranslation();
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);

  // Auto-translate when language is Czech
  useEffect(() => {
    if (!article || language !== 'cs') {
      setTranslatedTitle(null);
      setTranslatedDescription(null);
      return;
    }

    const translateContent = async () => {
      const textsToTranslate = [article.title];
      if (article.description) {
        textsToTranslate.push(article.description);
      }

      const results = await translate(textsToTranslate);
      setTranslatedTitle(results[0]);
      if (article.description && results[1]) {
        setTranslatedDescription(results[1]);
      }
    };

    translateContent();
  }, [article, language, translate]);

  // Reset translations when article changes
  useEffect(() => {
    setTranslatedTitle(null);
    setTranslatedDescription(null);
  }, [article?.id]);

  const displayTitle = (language === 'cs' && translatedTitle) ? translatedTitle : article?.title;
  const displayDescription = (language === 'cs' && translatedDescription) ? translatedDescription : article?.description;

  return (
    <AnimatePresence>
      {isOpen && article && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-slate-900 rounded-t-2xl border-t border-slate-700/50 shadow-2xl flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* Header with close button */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  {article.source}
                </span>
                {article.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {article.category}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Translation loading indicator */}
              {isTranslating && (
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {language === 'cs' ? 'Překládám...' : 'Translating...'}
                </div>
              )}

              {/* Image */}
              {article.imageUrl && (
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl font-semibold text-white leading-relaxed">
                {displayTitle}
              </h2>

              {/* Date */}
              <p className="text-sm text-slate-500">
                {formatDate(article.publishedAt, language)}
              </p>

              {/* Description */}
              {displayDescription && (
                <p className="text-base text-slate-300 leading-relaxed">
                  {displayDescription}
                </p>
              )}

              {/* Metadata badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {article.credibility !== undefined && (
                  <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                    {language === 'cs' ? 'Důvěryhodnost' : 'Credibility'}: {article.credibility}%
                  </span>
                )}
                {article.freshness && (
                  <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                    {article.freshness === 'hot' && '🔥'} {article.freshness}
                  </span>
                )}
                {article.sourceType && (
                  <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                    {article.sourceType}
                  </span>
                )}
              </div>
            </div>

            {/* Footer with link button */}
            <div className="px-5 py-4 border-t border-slate-800">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {language === 'cs' ? 'Číst originál' : 'Read original'}
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
