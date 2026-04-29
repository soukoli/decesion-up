'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePreloader } from '@/lib/preloader';
import { useSettings } from '@/lib/settings';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'expand' | 'exit'>('logo');
  const { acledTokens, isAcledTokenValid } = useSettings();
  const { isPreloading, hasPreloadedData } = usePreloader({ acledTokens, isAcledTokenValid });

  useEffect(() => {
    // Pokud máme předčasně načtená data, zkrátíme splash screen
    const effectiveDuration = hasPreloadedData ? Math.min(duration, 1500) : duration;
    
    // Phase 1: Logo animation (0-1500ms)
    const expandTimer = setTimeout(() => {
      setPhase('expand');
    }, 1000);

    // Phase 2: Exit animation 
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, effectiveDuration - 500);

    // Complete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, effectiveDuration);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration, hasPreloadedData]);

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 bg-slate-950"
            initial={{ opacity: 1 }}
            animate={{
              background: [
                'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)',
                'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
                'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Glow Rings */}
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,168,75,0.15) 0%, transparent 70%)',
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [0.5, 2, 2.5],
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 2, ease: 'easeOut', repeat: Infinity }}
          />
          
          <motion.div
            className="absolute w-[200px] h-[200px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,168,75,0.2) 0%, transparent 70%)',
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [0.5, 1.8, 2.2],
              opacity: [0, 0.6, 0],
            }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.3, repeat: Infinity }}
          />

          {/* Particle Effects */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                y: Math.sin((i * 30 * Math.PI) / 180) * 150,
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: 0.8 + i * 0.05,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Logo Container */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{
              scale: phase === 'expand' ? [1, 1.1, 1] : 1,
              opacity: 1,
              rotate: 0,
            }}
            transition={{
              scale: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
              opacity: { duration: 0.5 },
              rotate: { duration: 0.6, ease: 'easeOut' },
            }}
          >
            {/* Logo with Glow */}
            <motion.div
              className="relative"
              animate={{
                filter: [
                  'drop-shadow(0 0 10px rgba(212,168,75,0.3))',
                  'drop-shadow(0 0 30px rgba(212,168,75,0.6))',
                  'drop-shadow(0 0 10px rgba(212,168,75,0.3))',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/icon.png"
                alt="DecisionUp"
                width={120}
                height={120}
                className="rounded-3xl"
                priority
              />
            </motion.div>

            {/* App Name */}
            <motion.h1
              className="mt-6 text-3xl font-bold text-white tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              DecisionUp
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="mt-2 text-sm text-amber-400/80 font-medium tracking-wide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Signal, not noise
            </motion.p>

            {/* Loading Bar */}
            <motion.div
              className="mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                className={`h-full rounded-full ${
                  hasPreloadedData 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                    : isPreloading 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400' 
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
                initial={{ width: '0%' }}
                animate={{ 
                  width: hasPreloadedData ? '100%' : '100%',
                }}
                transition={{ duration: 1.5, delay: 0.9, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Preload Status Text */}
            <motion.p
              className="mt-3 text-xs text-slate-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {hasPreloadedData ? (
                <span className="text-green-400">✓ Data ready</span>
              ) : isPreloading ? (
                <span className="text-blue-400">⏳ Loading data...</span>
              ) : (
                <span className="text-amber-400/60">Initializing...</span>
              )}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage splash screen state with localStorage
export function useSplashScreen(skipAfterFirstVisit = false) {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    if (skipAfterFirstVisit) {
      const hasVisited = localStorage.getItem('decisionup_visited');
      if (hasVisited) {
        setShowSplash(false);
        setIsFirstVisit(false);
      }
    }
  }, [skipAfterFirstVisit]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (skipAfterFirstVisit) {
      localStorage.setItem('decisionup_visited', 'true');
    }
  };

  return { showSplash, isFirstVisit, handleSplashComplete };
}
