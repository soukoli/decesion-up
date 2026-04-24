'use client';

import { useState, useEffect } from 'react';
import { SchoolArticle } from '@/types';
import { SchoolCard } from './SchoolCard';
import { useTranslation } from '@/lib/translation';
import { SCHOOL_CATEGORY_COLORS, getSchoolCategories } from '@/lib/school-scraper';

interface SchoolSectionProps {
  initialArticles?: SchoolArticle[];
}

type CategoryFilter = ReturnType<typeof getSchoolCategories>[number];

export function SchoolSection({ initialArticles = [] }: SchoolSectionProps) {
  const [articles, setArticles] = useState<SchoolArticle[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('Vše');
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
      <div className="text-center py-8 text-slate-400">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">{language === 'cs' ? 'Načítám aktuality...' : 'Loading news...'}</p>
      </div>
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
      {/* Category filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-800">
        {getSchoolCategories().map((category) => {
          const isActive = activeCategory === category;
          const color = categoryColors[category];
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
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
            <SchoolCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-sm">
            {language === 'cs' ? 'Žádné články v této kategorii' : 'No articles in this category'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          {language === 'cs' 
            ? 'Klikni pro otevření na webu školy'
            : 'Click to open on school website'}
        </p>
      </div>
    </section>
  );
}
