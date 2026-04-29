'use client';

import { useCallback, useEffect, ReactNode } from 'react';
import { usePreloader } from '@/lib/preloader';
import { useSettings } from '@/lib/settings';
import debugLog from '@/lib/debug';

interface PreloadTriggerProps {
  children: ReactNode;
}

/**
 * Komponenta která obklopuje aplikaci a spouští předčasné načítání
 * při hover/focus událostech na okno/dokument
 */
export function PreloadTrigger({ children }: PreloadTriggerProps) {
  const { acledTokens, isAcledTokenValid } = useSettings();
  const { startPreloading } = usePreloader({ acledTokens, isAcledTokenValid });

  const handlePreloadTrigger = useCallback(() => {
    startPreloading();
  }, [startPreloading]);

  useEffect(() => {
    // Spustí preloading při focus na okno (např. alt+tab zpět)
    const handleWindowFocus = () => {
      debugLog.log('🎯 Window focused - triggering preload');
      handlePreloadTrigger();
    };

    // Spustí preloading při první interakci s dokumentem
    const handleFirstInteraction = () => {
      debugLog.log('👆 First user interaction - triggering preload');
      handlePreloadTrigger();
      
      // Po první interakci už nemusíme poslouchat
      document.removeEventListener('mouseover', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };

    // Spustí preloading při hover nad body (jen pro desktop)
    const handleBodyHover = () => {
      debugLog.log('🖱️ Body hover - triggering preload');
      handlePreloadTrigger();
      
      // Po prvním hover už nemusíme poslouchat
      document.body.removeEventListener('mouseenter', handleBodyHover);
    };

    // Event listeners
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('mouseover', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('click', handleFirstInteraction);
    
    // Pro desktop - hover nad celou stránkou
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      document.body.addEventListener('mouseenter', handleBodyHover);
    }

    // Spustí preloading okamžitě při načtení komponenty (fallback)
    const immediateTimeout = setTimeout(() => {
      debugLog.log('⏰ Timeout triggered - starting preload');
      handlePreloadTrigger();
    }, 100);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('mouseover', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
      document.body.removeEventListener('mouseenter', handleBodyHover);
      clearTimeout(immediateTimeout);
    };
  }, [handlePreloadTrigger]);

  return <>{children}</>;
}