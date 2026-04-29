'use client';

import { useState, useEffect, useCallback } from 'react';
import { SplashScreen, useSplashScreen } from '@/components/SplashScreen';
import { MobileLayout, AppData } from '@/components/mobile';
import { DesktopLayout } from '@/components/desktop/DesktopLayout';
import { useTranslation } from '@/lib/translation';
import { useSettings } from '@/lib/settings';
import { usePreloader } from '@/lib/preloader';
import { PageSkeleton } from '@/components/Skeleton';
import { PodcastEpisode, TechTrend, WorldNews, GlobalHotspot, AIResearch, StockIndex, MarketSignal } from '@/types';
import debugLog from '@/lib/debug';

export default function Home() {
  const [data, setData] = useState<AppData>({
    podcasts: [],
    markets: [],
    trends: [],
    news: [],
    czechNews: [],
    hotspots: [],
    research: [],
    stocks: [],
    school: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { showSplash, handleSplashComplete } = useSplashScreen(false);
  const { language } = useTranslation();
  const { acledTokens, isAcledTokenValid } = useSettings();
  const { getPreloadedData, clearPreloadCache } = usePreloader({ acledTokens, isAcledTokenValid });

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
    if (isRefresh) {
      setRefreshing(true);
      clearPreloadCache(); // Vymaž cache při refresh
    }
    
    // Zkus nejprve použít předčasně načtená data
    if (!isRefresh) {
      const preloadedData = getPreloadedData();
      if (preloadedData) {
      debugLog.log('✅ Using preloaded data, skipping fetch');
        setData(preloadedData);
        setLastRefresh(new Date());
        setLoading(false);
        return;
      }
    }
    
    const cacheBuster = isRefresh ? `?_t=${Date.now()}` : '';
    const fetchOptions: RequestInit = isRefresh ? { cache: 'no-store' as RequestCache } : {};
    
    // Add ACLED token to hotspots request if available and valid
    const acledToken = isAcledTokenValid ? acledTokens?.accessToken : null;
    const hotspotsOptions: RequestInit = {
      ...fetchOptions,
      ...(acledToken ? {
        headers: { 'Authorization': `Bearer ${acledToken}` }
      } : {})
    };
    
    try {
      const [podcastsRes, marketsRes, trendsRes, newsRes, czechNewsRes, hotspotsRes, researchRes, stocksRes, schoolRes] = await Promise.all([
        fetch(`/api/podcasts${cacheBuster}`, fetchOptions),
        fetch(`/api/markets${cacheBuster}`, fetchOptions),
        fetch(`/api/trends${cacheBuster}`, fetchOptions),
        fetch(`/api/news${cacheBuster}`, fetchOptions),
        fetch(`/api/news/czech${cacheBuster}`, fetchOptions),
        fetch(`/api/hotspots${cacheBuster}`, hotspotsOptions),
        fetch(`/api/research${cacheBuster}`, fetchOptions),
        fetch(`/api/stocks?period=5d${isRefresh ? '&_t=' + Date.now() : ''}`, fetchOptions),
        fetch(`/api/school${cacheBuster}`, fetchOptions),
      ]);

      const newData: AppData = {
        podcasts: [],
        markets: [],
        trends: [],
        news: [],
        czechNews: [],
        hotspots: [],
        research: [],
        stocks: [],
        school: [],
      };

      if (podcastsRes.ok) {
        const d = await podcastsRes.json();
        newData.podcasts = d.podcasts || [];
      }

      if (marketsRes.ok) {
        const d = await marketsRes.json();
        newData.markets = d.markets || [];
      }

      if (trendsRes.ok) {
        const d = await trendsRes.json();
        newData.trends = d.trends || [];
      }

      if (newsRes.ok) {
        const d = await newsRes.json();
        newData.news = d.news || [];
      }

      if (czechNewsRes.ok) {
        const d = await czechNewsRes.json();
        newData.czechNews = d.news || [];
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

      if (schoolRes.ok) {
        const d = await schoolRes.json();
        newData.school = d.articles || [];
      }

      setData(newData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [acledTokens, isAcledTokenValid, getPreloadedData, clearPreloadCache]);

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

  // Show loading state with skeleton UI
  if (loading) {
    return <PageSkeleton />;
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
