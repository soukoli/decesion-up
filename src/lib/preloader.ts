'use client';

import { useRef, useCallback } from 'react';
import { AppData } from '@/components/mobile';
import { preloadMonitor } from './preload-monitor';
import debugLog from './debug';

interface PreloadCache {
  data: AppData | null;
  timestamp: Date | null;
  isLoading: boolean;
  promise: Promise<AppData> | null;
}

// Global cache pro předčasně načtená data
let globalPreloadCache: PreloadCache = {
  data: null,
  timestamp: null,
  isLoading: false,
  promise: null
};

// Cache validity - data jsou platná 30 sekund
const CACHE_VALIDITY_MS = 30 * 1000;

export interface PreloaderOptions {
  acledTokens?: { accessToken: string } | null;
  isAcledTokenValid?: boolean;
}

/**
 * Hook pro předčasné načítání dat při hover/focus událostech
 * Umožňuje načíst data ještě před tím, než uživatel skutečně vejde do aplikace
 */
export function usePreloader(options: PreloaderOptions = {}) {
  const preloadStarted = useRef(false);
  const { acledTokens, isAcledTokenValid } = options;

  const isDataValid = useCallback((): boolean => {
    if (!globalPreloadCache.data || !globalPreloadCache.timestamp) {
      return false;
    }
    
    const now = new Date();
    const age = now.getTime() - globalPreloadCache.timestamp.getTime();
    return age < CACHE_VALIDITY_MS;
  }, []);

  const fetchAllData = useCallback(async (): Promise<AppData> => {
    preloadMonitor.startTimer('preload-fetch');
    
    // Příprava fetch options a ACLED tokenu
    const fetchOptions: RequestInit = {};
    const acledToken = isAcledTokenValid ? acledTokens?.accessToken : null;
    const hotspotsOptions: RequestInit = {
      ...fetchOptions,
      ...(acledToken ? {
        headers: { 'Authorization': `Bearer ${acledToken}` }
      } : {})
    };

    try {
      preloadMonitor.startTimer('api-calls');
      
      // Paralelní načítání všech API endpointů
      const [podcastsRes, marketsRes, trendsRes, newsRes, czechNewsRes, hotspotsRes, researchRes, stocksRes, schoolRes] = await Promise.all([
        fetch(`/api/podcasts`, fetchOptions),
        fetch(`/api/markets`, fetchOptions),
        fetch(`/api/trends`, fetchOptions),
        fetch(`/api/news`, fetchOptions),
        fetch(`/api/news/czech`, fetchOptions),
        fetch(`/api/hotspots`, hotspotsOptions),
        fetch(`/api/research`, fetchOptions),
        fetch(`/api/stocks?period=5d`, fetchOptions),
        fetch(`/api/school`, fetchOptions),
      ]);
      
      preloadMonitor.endTimer('api-calls');
      preloadMonitor.startTimer('data-processing');

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

      // Zpracování odpovědí (stejná logika jako v page.tsx)
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

      preloadMonitor.endTimer('data-processing');

      // Update global cache
      globalPreloadCache = {
        data: newData,
        timestamp: new Date(),
        isLoading: false,
        promise: null
      };

      const totalTime = preloadMonitor.endTimer('preload-fetch');
      debugLog.log(`✅ Preload completed in ${totalTime.toFixed(2)}ms`);
      preloadMonitor.logSummary();

      return newData;
    } catch (error) {
      console.error('Error preloading data:', error);
      preloadMonitor.endTimer('preload-fetch');
      globalPreloadCache.isLoading = false;
      globalPreloadCache.promise = null;
      throw error;
    }
  }, [acledTokens, isAcledTokenValid]);

  /**
   * Spustí předčasné načítání dat
   * Volat při hover/focus událostech
   */
  const startPreloading = useCallback((): Promise<AppData> | null => {
    // Pokud už máme platná data, nemusíme nic dělat
    if (isDataValid()) {
      debugLog.log('✅ Using cached preloaded data');
      return Promise.resolve(globalPreloadCache.data!);
    }

    // Pokud už načítání probíhá, vrátíme existující promise
    if (globalPreloadCache.isLoading && globalPreloadCache.promise) {
      debugLog.log('⏳ Preloading already in progress');
      return globalPreloadCache.promise;
    }

    // Spustíme nové načítání
    if (!preloadStarted.current) {
      debugLog.log('🚀 Starting data preloading');
      preloadStarted.current = true;
      globalPreloadCache.isLoading = true;
      
      const promise = fetchAllData();
      globalPreloadCache.promise = promise;
      
      return promise;
    }

    return null;
  }, [isDataValid, fetchAllData]);

  /**
   * Získá předčasně načtená data pokud jsou k dispozici
   */
  const getPreloadedData = useCallback((): AppData | null => {
    return isDataValid() ? globalPreloadCache.data : null;
  }, [isDataValid]);

  /**
   * Vymaže cache (např. při refresh)
   */
  const clearPreloadCache = useCallback(() => {
    globalPreloadCache = {
      data: null,
      timestamp: null,
      isLoading: false,
      promise: null
    };
    preloadStarted.current = false;
    debugLog.log('🧹 Preload cache cleared');
  }, []);

  return {
    startPreloading,
    getPreloadedData,
    clearPreloadCache,
    isPreloading: globalPreloadCache.isLoading,
    hasPreloadedData: isDataValid()
  };
}