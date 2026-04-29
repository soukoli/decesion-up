'use client';

import { useState, useEffect, useCallback } from 'react';
import { SchoolArticle } from '@/types';
import debugLog from './debug';

// Klíč pro localStorage
const STORAGE_KEY = 'decisionup_school_read_articles';
const LAST_VISIT_KEY = 'decisionup_school_last_visit';

interface SchoolReadState {
  readArticles: Set<string>;
  lastVisit: Date | null;
}

/**
 * Hook pro správu read/unread stavu školních článků
 * Používá localStorage pro perzistenci dat
 */
export function useSchoolReadState() {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  const [lastVisit, setLastVisit] = useState<Date | null>(null);

  // Načtení stavu z localStorage při mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Načtení přečtených článků
      const storedReadArticles = localStorage.getItem(STORAGE_KEY);
      if (storedReadArticles) {
        const readIds = JSON.parse(storedReadArticles);
        setReadArticles(new Set(Array.isArray(readIds) ? readIds : []));
      }

      // Načtení poslední návštěvy
      const storedLastVisit = localStorage.getItem(LAST_VISIT_KEY);
      if (storedLastVisit) {
        setLastVisit(new Date(storedLastVisit));
      }

      console.log('📖 School read state loaded from localStorage');
    } catch (error) {
      console.error('Error loading school read state:', error);
      setReadArticles(new Set());
      setLastVisit(null);
    }
  }, []);

  // Uložení do localStorage při změně
  const saveToStorage = useCallback((newReadArticles: Set<string>) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newReadArticles)));
      debugLog.log(`💾 Saved ${newReadArticles.size} read articles to localStorage`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Označení článku jako přečteného
  const markAsRead = useCallback((articleId: string) => {
    setReadArticles(prev => {
      const newSet = new Set(prev);
      newSet.add(articleId);
      saveToStorage(newSet);
      return newSet;
    });
    debugLog.log(`✓ Article ${articleId} marked as read`);
  }, [saveToStorage]);

  // Označení článku jako nepřečteného
  const markAsUnread = useCallback((articleId: string) => {
    setReadArticles(prev => {
      const newSet = new Set(prev);
      newSet.delete(articleId);
      saveToStorage(newSet);
      return newSet;
    });
    debugLog.log(`✗ Article ${articleId} marked as unread`);
  }, [saveToStorage]);

  // Toggle read stavu
  const toggleRead = useCallback((articleId: string) => {
    if (readArticles.has(articleId)) {
      markAsUnread(articleId);
    } else {
      markAsRead(articleId);
    }
  }, [readArticles, markAsRead, markAsUnread]);

  // Kontrola jestli je článek přečtený
  const isRead = useCallback((articleId: string): boolean => {
    return readArticles.has(articleId);
  }, [readArticles]);

  // Kontrola jestli je článek nový (novější než poslední návštěva)
  const isNew = useCallback((article: SchoolArticle): boolean => {
    if (!lastVisit) {
      // Pokud je to první návštěva, považujeme za nové články z posledních 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(article.pubDate) > oneDayAgo;
    }
    
    return new Date(article.pubDate) > lastVisit;
  }, [lastVisit]);

  // Aktualizace času poslední návštěvy (volat při otevření školní sekce)
  const updateLastVisit = useCallback(() => {
    const now = new Date();
    setLastVisit(now);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LAST_VISIT_KEY, now.toISOString());
        debugLog.log('🕐 Last visit time updated');
      } catch (error) {
        console.error('Error updating last visit:', error);
      }
    }
  }, []);

  // Rozšíření článků o read/new stavy
  const enrichArticles = useCallback((articles: SchoolArticle[]): SchoolArticle[] => {
    return articles.map(article => ({
      ...article,
      isRead: isRead(article.id),
      isNew: isNew(article)
    }));
  }, [isRead, isNew]);

  // Počty pro statistiky
  const getStats = useCallback((articles: SchoolArticle[]) => {
    const enriched = enrichArticles(articles);
    return {
      total: enriched.length,
      read: enriched.filter(a => a.isRead).length,
      unread: enriched.filter(a => !a.isRead).length,
      new: enriched.filter(a => a.isNew).length
    };
  }, [enrichArticles]);

  // Vymazání všech přečtených článků (reset)
  const clearReadState = useCallback(() => {
    setReadArticles(new Set());
    setLastVisit(null);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LAST_VISIT_KEY);
        debugLog.log('🗑️ School read state cleared');
      } catch (error) {
        console.error('Error clearing read state:', error);
      }
    }
  }, []);

  return {
    // Core functions
    markAsRead,
    markAsUnread,
    toggleRead,
    isRead,
    isNew,
    updateLastVisit,
    
    // Data enrichment
    enrichArticles,
    
    // Stats
    getStats,
    
    // State management
    clearReadState,
    
    // Raw state
    readArticles: Array.from(readArticles),
    lastVisit
  };
}