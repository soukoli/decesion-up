'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { PodcastSection } from '@/components/podcasts/PodcastSection';
import { EconomicSection } from '@/components/economic/EconomicSection';
import { TrendsSection } from '@/components/trends/TrendsSection';
import { NewsSection } from '@/components/news/NewsSection';
import { GlobeSection } from '@/components/globe/GlobeSection';
import { ResearchSection } from '@/components/research/ResearchSection';
import { TrendingSection, SearchTrend } from '@/components/trending/TrendingSection';
import { StocksSection } from '@/components/stocks';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/lib/translation';
import { PodcastEpisode, EconomicSignal, TechTrend, WorldNews, GlobalHotspot, AIResearch, StockIndex } from '@/types';

export default function Home() {
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [economic, setEconomic] = useState<EconomicSignal[]>([]);
  const [trends, setTrends] = useState<TechTrend[]>([]);
  const [news, setNews] = useState<WorldNews[]>([]);
  const [hotspots, setHotspots] = useState<GlobalHotspot[]>([]);
  const [research, setResearch] = useState<AIResearch[]>([]);
  const [trending, setTrending] = useState<SearchTrend[]>([]);
  const [stocks, setStocks] = useState<StockIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { language } = useTranslation();
  
  const now = new Date();
  const greetingEN = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const greetingCZ = now.getHours() < 12 ? 'Dobré ráno' : now.getHours() < 18 ? 'Dobré odpoledne' : 'Dobrý večer';
  const greeting = language === 'cs' ? greetingCZ : greetingEN;
  
  const dateStr = now.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const [podcastsRes, economicRes, trendsRes, newsRes, hotspotsRes, researchRes, trendingRes, stocksRes] = await Promise.all([
        fetch('/api/podcasts'),
        fetch('/api/economic'),
        fetch('/api/trends'),
        fetch('/api/news'),
        fetch('/api/hotspots'),
        fetch('/api/research'),
        fetch('/api/trending'),
        fetch('/api/stocks?period=5d'),
      ]);

      if (podcastsRes.ok) {
        const data = await podcastsRes.json();
        setPodcasts(data.podcasts || []);
      }

      if (economicRes.ok) {
        const data = await economicRes.json();
        setEconomic(data.economic || []);
      }

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.trends || []);
      }

      if (newsRes.ok) {
        const data = await newsRes.json();
        setNews(data.news || []);
      }

      if (hotspotsRes.ok) {
        const data = await hotspotsRes.json();
        setHotspots(data.hotspots || []);
      }

      if (researchRes.ok) {
        const data = await researchRes.json();
        setResearch(data.research || []);
      }

      if (trendingRes.ok) {
        const data = await trendingRes.json();
        setTrending(data.trending || []);
      }

      if (stocksRes.ok) {
        const data = await stocksRes.json();
        setStocks(data || []);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatLastRefresh = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/icon.png"
              alt="DecisionUp"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-lg font-bold text-white">DecisionUp</h1>
              <p className="text-xs text-slate-400">Signal, not noise</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="text-right">
              <p className="text-sm text-slate-300">{greeting}</p>
              <p className="text-xs text-slate-500">{dateStr}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Quick Summary with Last Refresh */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-slate-800/50 border border-amber-500/20">
          {loading ? (
            <p className="text-sm text-slate-400">Loading your daily intelligence...</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-slate-300">
                <span className="text-amber-400 font-semibold">Today:</span>{' '}
                {hotspots.length} hotspots • {news.length} news • {trending.length} trending • {research.length} AI papers
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  Updated {formatLastRefresh(lastRefresh)}
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg 
                    className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Hotspots - 3D Globe */}
        <GlobeSection hotspots={hotspots} />

        {/* What the World is Searching */}
        <TrendingSection trending={trending} />

        {/* World News Section */}
        <NewsSection news={news} />

        {/* Podcasts Section */}
        <PodcastSection episodes={podcasts} />

        {/* Market Indices with Charts */}
        <StocksSection initialStocks={stocks} />

        {/* Two Column Layout for smaller sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Economic Signals */}
          <EconomicSection signals={economic} />

          {/* Tech Trends */}
          <TrendsSection trends={trends} />
        </div>

        {/* AI Research Papers */}
        <ResearchSection research={research} />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            DecisionUp • Your personal intelligence feed
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Sources: GDELT, Google Trends, Reuters, BBC, Guardian, Yahoo Finance, ECB, Hacker News, arXiv
          </p>
          {lastRefresh && (
            <p className="text-xs text-slate-600 mt-2">
              Last updated: {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </footer>
      </main>
    </div>
  );
}
