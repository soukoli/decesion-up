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

  // Reset on article change
  useEffect(() => {
    setTranslatedTitle(null);
    setTranslatedDescription(null);
  }, [article?.id]);

  const displayTitle = (language === 'cs' && translatedTitle) ? translatedTitle : article?.title;
  const displayDescription = (language === 'cs' && translatedDescription) ? translatedDescription : article?.description;

  return (
    <AnimatePresence>
      {isOpen && article && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-800">
            <button
              onClick={onClose}
              className="flex items-center gap-2 p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">{language === 'cs' ? 'Zpět' : 'Back'}</span>
            </button>
            <div className="flex items-center gap-2">
              {article.credibility && article.credibility > 80 && (
                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                  ✓ {language === 'cs' ? 'Ověřeno' : 'Verified'}
                </span>
              )}
              {isTranslating && (
                <svg className="w-4 h-4 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
          </div>

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-4">
            {/* Source + Category */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                {article.source}
              </span>
              {article.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {article.category}
                </span>
              )}
            </div>

            {/* Image */}
            {article.imageUrl && (
              <div className="rounded-xl overflow-hidden -mx-1">
                <img
                  src={article.imageUrl}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold text-white leading-snug">
              {displayTitle}
            </h1>

            {/* Date */}
            <p className="text-sm text-slate-500">
              {formatDate(article.publishedAt, language)}
            </p>

            {/* Description / Content */}
            {displayDescription && (
              <div className="text-base text-slate-300 leading-relaxed whitespace-pre-line">
                {displayDescription}
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
              {article.freshness && (
                <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-400">
                  {article.freshness === 'hot' && '🔥 '}{article.freshness}
                </span>
              )}
              {article.sourceType && (
                <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-400">
                  {article.sourceType === 'public' ? '📺 ' : ''}{article.sourceType}
                </span>
              )}
            </div>
          </div>

          {/* Footer - source link */}
          <div className="flex-shrink-0 p-4 border-t border-slate-800">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {language === 'cs' ? 'Číst originál na ' + article.source : 'Read original on ' + article.source}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
