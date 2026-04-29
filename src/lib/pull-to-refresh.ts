'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => void;
  pullThreshold?: number;
  disabled?: boolean;
}

/**
 * Hook pro pull-to-refresh funkcionalitu na mobilních zařízeních
 * Implementuje smooth animace a touch handling
 */
export function usePullToRefresh({
  onRefresh,
  pullThreshold = 80,
  disabled = false
}: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleRefresh = useCallback(async () => {
    if (disabled) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      // Delay reset pro smooth UX
      setTimeout(() => {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }, 500);
    }
  }, [onRefresh, disabled]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Kontrola jestli je container na topu
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !isDragging.current) return;

    const container = containerRef.current;
    if (!container) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;

    // Pouze pokud táhneme dolů a jsme na vrchu
    if (deltaY > 0 && container.scrollTop === 0) {
      e.preventDefault(); // Zabránit defaultnímu scrollingu
      
      // Vypočítání pull distance s resistance efektem
      const resistance = 0.5;
      const distance = Math.min(deltaY * resistance, pullThreshold * 1.5);
      
      setPullDistance(distance);
      setIsPulling(distance > pullThreshold);
    }
  }, [disabled, pullThreshold]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    isDragging.current = false;
    
    if (pullDistance > pullThreshold && !isRefreshing) {
      handleRefresh();
    } else {
      // Reset bez refresh
      setIsPulling(false);
      setPullDistance(0);
    }
  }, [disabled, pullDistance, pullThreshold, isRefreshing, handleRefresh]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Refresh indicator style
  const refreshIndicatorStyle = {
    transform: `translateY(${Math.min(pullDistance, pullThreshold)}px)`,
    opacity: Math.min(pullDistance / pullThreshold, 1),
  };

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    refreshIndicatorStyle,
    canRefresh: pullDistance > pullThreshold,
  };
}