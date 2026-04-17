'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'en' | 'cs';

interface TranslationCache {
  [key: string]: string;
}

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (texts: string[]) => Promise<string[]>;
  getTranslation: (text: string) => string;
  isTranslating: boolean;
  translationCache: TranslationCache;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<TranslationCache>({});

  const translate = useCallback(async (texts: string[]): Promise<string[]> => {
    if (language === 'en') {
      return texts; // No translation needed
    }

    // Check cache first
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];
    
    texts.forEach((text, index) => {
      if (!translationCache[text]) {
        uncachedTexts.push(text);
        uncachedIndices.push(index);
      }
    });

    if (uncachedTexts.length === 0) {
      // All texts are cached
      return texts.map(text => translationCache[text] || text);
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: uncachedTexts,
          targetLang: 'cs',
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translations: string[] = data.translations;

      // Update cache
      const newCache: TranslationCache = { ...translationCache };
      uncachedTexts.forEach((text, i) => {
        newCache[text] = translations[i];
      });
      setTranslationCache(newCache);

      // Return results with cached + new translations
      return texts.map(text => newCache[text] || text);
    } catch (error) {
      console.error('Translation error:', error);
      return texts; // Return originals on error
    } finally {
      setIsTranslating(false);
    }
  }, [language, translationCache]);

  const getTranslation = useCallback((text: string): string => {
    if (language === 'en') return text;
    return translationCache[text] || text;
  }, [language, translationCache]);

  return (
    <TranslationContext.Provider value={{
      language,
      setLanguage,
      translate,
      getTranslation,
      isTranslating,
      translationCache,
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
