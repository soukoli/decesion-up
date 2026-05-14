'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePullToRefresh } from '@/lib/pull-to-refresh';
import { useTranslation } from '@/lib/translation';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, disabled = false, className = '' }: PullToRefreshProps) {
  const { language } = useTranslation();
  
  const {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    canRefresh
  } = usePullToRefresh({ 
    onRefresh: async () => {
      await onRefresh();
    }, 
    disabled 
  });

  // Animate the arrow rotation based on pull state
  const arrowRotation = canRefresh ? 180 : 0;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
      style={{ 
        touchAction: disabled ? 'auto' : 'manipulation',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center z-10 pointer-events-none"
        style={{
          height: '80px',
          transform: `translateY(-80px)`,
        }}
      >
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ y: 0, opacity: 0 }}
          animate={{ 
            y: Math.min(pullDistance, 80), 
            opacity: Math.min(pullDistance / 40, 1),
            scale: isPulling ? Math.min(0.9 + (pullDistance / 200), 1.1) : 1
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Refresh icon with enhanced animation */}
          <div className="relative">
            {isRefreshing ? (
              // Loading spinner with pulsing effect
              <div className="relative">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-amber-400/30 rounded-full animate-ping" />
              </div>
            ) : (
              // Arrow icon with enhanced rotation and scaling
              <motion.div
                animate={{ 
                  rotate: arrowRotation,
                  scale: canRefresh ? 1.2 : 1
                }}
                transition={{ type: 'spring', damping: 15, stiffness: 400 }}
              >
                <svg
                  className={`w-8 h-8 transition-all duration-300 ${
                    canRefresh ? 'text-amber-400 drop-shadow-glow' : 'text-slate-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={canRefresh ? 2.5 : 2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Status text */}
          <motion.div
            className="mt-2 text-xs font-medium text-center"
            animate={{ 
              color: isRefreshing 
                ? '#f59e0b' 
                : canRefresh 
                  ? '#f59e0b' 
                  : '#94a3b8' 
            }}
          >
            {isRefreshing ? (
              language === 'cs' ? 'Aktualizuji...' : 'Refreshing...'
            ) : canRefresh ? (
              language === 'cs' ? 'Pusť pro aktualizaci' : 'Release to refresh'
            ) : (
              language === 'cs' ? 'Táhni dolů' : 'Pull down'
            )}
          </motion.div>

          {/* Enhanced progress bar with gradient animation */}
          <motion.div 
            className="mt-2 h-1 bg-slate-700/50 rounded-full overflow-hidden relative"
            style={{ width: '60px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: pullDistance > 0 ? 1 : 0 }}
          >
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{ 
                width: `${Math.min((pullDistance / 80) * 100, 100)}%`,
                background: canRefresh 
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)' 
                  : 'linear-gradient(90deg, #64748b, #94a3b8)'
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              {canRefresh && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    ease: 'easeInOut' 
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Content with pull effect */}
      <motion.div
        className="h-full"
        animate={{ 
          y: isPulling || isRefreshing ? Math.min(pullDistance * 0.5, 40) : 0 
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {children}
      </motion.div>

      {/* Haptic feedback overlay */}
      <AnimatePresence>
        {canRefresh && !isRefreshing && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
            style={{ 
              background: 'radial-gradient(circle at center top, #f59e0b 0%, transparent 70%)' 
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}