'use client';

import { useState, useEffect } from 'react';
import { SchoolArticle } from '@/types';
import { SchoolCard } from './SchoolCard';
import { useTranslation } from '@/lib/translation';
import { SCHOOL_CATEGORY_COLORS, getSchoolCategories } from '@/lib/school-scraper';
import { SchoolCardSkeleton } from '../Skeleton';
import { SectionHeader } from '../mobile/SectionHeader';

interface SchoolSectionProps {
  initialArticles?: SchoolArticle[];
}

type CategoryFilter = ReturnType<typeof getSchoolCategories>[number];

export function SchoolSection({ initialArticles = [] }: SchoolSectionProps) {
  const [articles, setArticles] = useState<SchoolArticle[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Vše');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(new Date());
  const { language } = useTranslation();

  useEffect(() => {
    if (initialArticles.length === 0) {
      fetchArticles();
    }
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/school');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error fetching school articles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter by category
  const filteredArticles = activeCategory === 'Vše' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  // Category labels for UI
  const categoryLabels: Record<CategoryFilter, { en: string; cs: string }> = {
    'Vše': { en: 'All', cs: 'Vše' },
    'Novinky': { en: 'News', cs: 'Novinky' },
    'Družina': { en: 'After-school', cs: 'Družina' },
  };

  // Category colors for filter buttons
  const categoryColors: Record<CategoryFilter, string> = {
    'Vše': '#9ca3af',
    'Novinky': SCHOOL_CATEGORY_COLORS.Novinky,
    'Družina': SCHOOL_CATEGORY_COLORS.Družina,
  };

  if (loading) {
    return (
      <section className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-6 bg-slate-700/50 rounded-lg w-40 animate-pulse"></div>
        </div>
        
        {/* Filter tabs skeleton */}
        <div className="flex gap-2 pb-3 border-b border-slate-800">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-8 w-20 bg-slate-700/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        {/* School cards skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <SchoolCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="space-y-4">
        <div className="text-center py-6 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-sm">
            {language === 'cs' ? 'Nepodařilo se načíst aktuality' : 'Failed to load news'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <SectionHeader
        title={language === 'cs' ? 'Horáčkova' : 'School News'}
        lastRefresh={lastRefresh}
        onRefresh={fetchArticles}
        refreshing={loading}
      />

      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-800">
        {getSchoolCategories().map((category) => {
          const isActive = activeCategory === category;
          const color = categoryColors[category];
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all relative ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              style={isActive ? { 
                backgroundColor: `${color}20`, 
                color: color,
                border: `1px solid ${color}50`
              } : { border: '1px solid transparent' }}
            >
              {categoryLabels[category][language]}
              {category !== 'Vše' && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  ({articles.filter(a => a.category === category).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Compact list layout */}
      {filteredArticles.length > 0 ? (
        <div className="space-y-2">
          {filteredArticles.map((article) => (
            <SchoolCard 
              key={article.id} 
              article={article}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-sm">
            {language === 'cs' ? 'Žádné články v této kategorii' : 'No articles in this category'}
          </p>
        </div>
      )}

      {/* Footer with simple info */}
      <div className="pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <span>
            {language === 'cs' 
              ? 'Klikni pro otevření na webu školy'
              : 'Click to open on school website'}
          </span>
          <span>
            {language === 'cs' 
              ? `${filteredArticles.length} článků`
              : `${filteredArticles.length} articles`}
          </span>
        </div>
      </div>
    </section>
  );
}
