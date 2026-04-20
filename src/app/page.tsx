'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SplashScreen, useSplashScreen } from '@/components/SplashScreen';
import { MobileLayout, AppData } from '@/components/mobile';
import { DesktopLayout } from '@/components/desktop/DesktopLayout';
import { useTranslation } from '@/lib/translation';
import { PodcastEpisode, EconomicSignal, TechTrend, WorldNews, GlobalHotspot, AIResearch, StockIndex, AICommunity } from '@/types';
import { SearchTrend } from '@/components/trending/TrendingSection';

export default function Home() {
  const [data, setData] = useState<AppData>({
    podcasts: [],
    economic: [],
    trends: [],
    news: [],
    hotspots: [],
    research: [],
    stocks: [],
    aiCommunities: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { showSplash, handleSplashComplete } = useSplashScreen(false); // Show splash every time for now
  const { language } = useTranslation();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    const cacheBuster = isRefresh ? `?_t=${Date.now()}` : '';
    const fetchOptions = isRefresh ? { cache: 'no-store' as RequestCache } : {};
    
    try {
      const [podcastsRes, economicRes, trendsRes, newsRes, hotspotsRes, researchRes, stocksRes, aiCommunitiesRes] = await Promise.all([
        fetch(`/api/podcasts${cacheBuster}`, fetchOptions),
        fetch(`/api/economic${cacheBuster}`, fetchOptions),
        fetch(`/api/trends${cacheBuster}`, fetchOptions),
        fetch(`/api/news${cacheBuster}`, fetchOptions),
        fetch(`/api/hotspots${cacheBuster}`, fetchOptions),
        fetch(`/api/research${cacheBuster}`, fetchOptions),
        fetch(`/api/stocks?period=5d${isRefresh ? '&_t=' + Date.now() : ''}`, fetchOptions),
        fetch(`/api/ai-communities${cacheBuster}`, fetchOptions),
      ]);

      const newData: AppData = {
        podcasts: [],
        economic: [],
        trends: [],
        news: [],
        hotspots: [],
        research: [],
        stocks: [],
        aiCommunities: [],
      };

      if (podcastsRes.ok) {
        const d = await podcastsRes.json();
        newData.podcasts = d.podcasts || [];
      }

      if (economicRes.ok) {
        const d = await economicRes.json();
        newData.economic = d.economic || [];
      }

      if (trendsRes.ok) {
        const d = await trendsRes.json();
        newData.trends = d.trends || [];
      }

      if (newsRes.ok) {
        const d = await newsRes.json();
        newData.news = d.news || [];
      }

      if (hotspotsRes.ok) {
        const d = await hotspotsRes.json();
        newData.hotspots = d.hotspots || [];
      }

      if (researchRes.ok) {
        const d = await researchRes.json();
        newData.research = d.research || [];
      }

      if (stocksRes.ok) {
        const d = await stocksRes.json();
        newData.stocks = d || [];
      }

      if (aiCommunitiesRes.ok) {
        const d = await aiCommunitiesRes.json();
        newData.aiCommunities = d.communities || [];
      }

      setData(newData);
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

  const handleRefresh = () => {
    fetchData(true);
  };

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={2500} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            {language === 'cs' ? 'Načítám data...' : 'Loading data...'}
          </p>
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <MobileLayout
        data={data}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        lastRefresh={lastRefresh}
      />
    );
  }

  // Desktop layout
  return (
    <DesktopLayout
      data={data}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      lastRefresh={lastRefresh}
    />
  );
}
