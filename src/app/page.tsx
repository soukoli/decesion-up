'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SplashScreen, useSplashScreen } from '@/components/SplashScreen';
import { MobileLayout, AppData } from '@/components/mobile';
import { DesktopLayout } from '@/components/desktop/DesktopLayout';
import { useTranslation } from '@/lib/translation';
import { useSettings } from '@/lib/settings';
import { usePreloader } from '@/lib/preloader';
import { PageSkeleton } from '@/components/Skeleton';
import debugLog from '@/lib/debug';

// Stale thresholds (in ms)
const TRANSPORT_STALE_MS = 60 * 1000;  // 1 minute
const WEATHER_STALE_MS = 5 * 60 * 1000; // 5 minutes

export default function Home() {
  const [data, setData] = useState<AppData>({
    podcasts: [],
    trends: [],
    news: [],
    czechNews: [],
    hotspots: [],
    research: [],
    school: [],
    transport: [],
    weather: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track when each data source was last fetched
  const lastFetchedRef = useRef<{ transport: number; weather: number; full: number }>({
    transport: 0,
    weather: 0,
    full: 0,
  });
  
  const { showSplash, handleSplashComplete } = useSplashScreen(false);
  const { language } = useTranslation();
  const { acledTokens, isAcledTokenValid } = useSettings();
  const { getPreloadedData, clearPreloadCache } = usePreloader({ acledTokens, isAcledTokenValid });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Selective refresh for transport only
  const refreshTransport = useCallback(async () => {
    try {
      const res = await fetch('/api/transport');
      if (res.ok) {
        const d = await res.json();
        setData(prev => ({ ...prev, transport: d.alerts || [] }));
        lastFetchedRef.current.transport = Date.now();
      }
    } catch { /* silent */ }
  }, []);

  // Selective refresh for weather only
  const refreshWeather = useCallback(async () => {
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const d = await res.json();
        setData(prev => ({ ...prev, weather: d.weather || null }));
        lastFetchedRef.current.weather = Date.now();
      }
    } catch { /* silent */ }
  }, []);

  // Full data fetch (initial load + pull-to-refresh)
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      clearPreloadCache();
    }
    
    if (!isRefresh) {
      const preloadedData = getPreloadedData();
      if (preloadedData) {
        debugLog.log('✅ Using preloaded data, skipping fetch');
        setData(preloadedData);
        setLastRefresh(new Date());
        setLoading(false);
        const now = Date.now();
        lastFetchedRef.current = { transport: now, weather: now, full: now };
        return;
      }
    }
    
    const cacheBuster = isRefresh ? `?_t=${Date.now()}` : '';
    const fetchOptions: RequestInit = isRefresh ? { cache: 'no-store' as RequestCache } : {};
    
    const acledToken = isAcledTokenValid ? acledTokens?.accessToken : null;
    const hotspotsOptions: RequestInit = {
      ...fetchOptions,
      ...(acledToken ? { headers: { 'Authorization': `Bearer ${acledToken}` } } : {})
    };
    
    try {
      const [podcastsRes, trendsRes, newsRes, czechNewsRes, hotspotsRes, researchRes, schoolRes, transportRes, weatherRes] = await Promise.all([
        fetch(`/api/podcasts${cacheBuster}`, fetchOptions),
        fetch(`/api/trends${cacheBuster}`, fetchOptions),
        fetch(`/api/news${cacheBuster}`, fetchOptions),
        fetch(`/api/news/czech${cacheBuster}`, fetchOptions),
        fetch(`/api/hotspots${cacheBuster}`, hotspotsOptions),
        fetch(`/api/research${cacheBuster}`, fetchOptions),
        fetch(`/api/school${cacheBuster}`, fetchOptions),
        fetch(`/api/transport${cacheBuster}`, fetchOptions),
        fetch(`/api/weather${cacheBuster}`, fetchOptions),
      ]);

      const newData: AppData = {
        podcasts: [],
        trends: [],
        news: [],
        czechNews: [],
        hotspots: [],
        research: [],
        school: [],
        transport: [],
        weather: null,
      };

      if (podcastsRes.ok) { const d = await podcastsRes.json(); newData.podcasts = d.podcasts || []; }
      if (trendsRes.ok) { const d = await trendsRes.json(); newData.trends = d.trends || []; }
      if (newsRes.ok) { const d = await newsRes.json(); newData.news = d.news || []; }
      if (czechNewsRes.ok) { const d = await czechNewsRes.json(); newData.czechNews = d.news || []; }
      if (hotspotsRes.ok) { const d = await hotspotsRes.json(); newData.hotspots = d.hotspots || []; }
      if (researchRes.ok) { const d = await researchRes.json(); newData.research = d.research || []; }
      if (schoolRes.ok) { const d = await schoolRes.json(); newData.school = d.articles || []; }
      if (transportRes.ok) { const d = await transportRes.json(); newData.transport = d.alerts || []; }
      if (weatherRes.ok) { const d = await weatherRes.json(); newData.weather = d.weather || null; }

      setData(newData);
      setLastRefresh(new Date());
      const now = Date.now();
      lastFetchedRef.current = { transport: now, weather: now, full: now };
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [acledTokens, isAcledTokenValid, getPreloadedData, clearPreloadCache]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Visibility-based stale refresh
  // When app becomes visible (user returns from lock screen, tab switch, etc.)
  // check if data is stale and refresh only what's needed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      
      const now = Date.now();
      const { transport, weather } = lastFetchedRef.current;

      // Check transport staleness (1 min threshold)
      if (now - transport > TRANSPORT_STALE_MS) {
        debugLog.log('🔄 Transport data stale, refreshing...');
        refreshTransport();
      }

      // Check weather staleness (5 min threshold)
      if (now - weather > WEATHER_STALE_MS) {
        debugLog.log('🔄 Weather data stale, refreshing...');
        refreshWeather();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshTransport, refreshWeather]);

  const handleRefresh = () => {
    fetchData(true);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={2500} />;
  }

  if (loading) {
    return <PageSkeleton />;
  }

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

  return (
    <DesktopLayout
      data={data}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      lastRefresh={lastRefresh}
    />
  );
}
