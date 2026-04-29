'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
}

/**
 * Základní skeleton komponent pro loading states
 */
export function Skeleton({ 
  className = '', 
  variant = 'rectangular', 
  width = '100%', 
  height = '1rem' 
}: SkeletonProps) {
  const baseClasses = 'bg-slate-700/50 animate-pulse';
  
  let variantClasses = '';
  switch (variant) {
    case 'text':
      variantClasses = 'rounded-sm h-4';
      break;
    case 'circular':
      variantClasses = 'rounded-full';
      break;
    case 'rectangular':
    default:
      variantClasses = 'rounded-lg';
      break;
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={{ width, height }}
      initial={{ opacity: 0.5 }}
      animate={{ 
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
    />
  );
}

/**
 * Skeleton pro podcast kartu
 */
export function PodcastCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      {/* Image */}
      <Skeleton variant="rectangular" width="56px" height="56px" className="flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title */}
        <Skeleton variant="text" height="16px" width="80%" />
        
        {/* Description */}
        <Skeleton variant="text" height="14px" width="100%" />
        <Skeleton variant="text" height="14px" width="60%" />
        
        {/* Metadata row */}
        <div className="flex items-center gap-2">
          <Skeleton variant="text" height="12px" width="60px" />
          <Skeleton variant="text" height="12px" width="40px" />
          <Skeleton variant="text" height="12px" width="50px" />
        </div>
      </div>
      
      {/* Action button */}
      <Skeleton variant="circular" width="40px" height="40px" className="flex-shrink-0" />
    </div>
  );
}

/**
 * Skeleton pro školní článek
 */
export function SchoolCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      {/* Image */}
      <Skeleton variant="rectangular" width="56px" height="56px" className="flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <Skeleton variant="text" height="14px" width="70%" />
          <Skeleton variant="rectangular" width="50px" height="18px" />
          <Skeleton variant="text" height="12px" width="30px" />
        </div>
        
        {/* Description */}
        <Skeleton variant="text" height="14px" width="90%" />
        
        {/* Source */}
        <Skeleton variant="text" height="12px" width="80px" />
      </div>
      
      {/* Icon */}
      <Skeleton variant="circular" width="40px" height="40px" className="flex-shrink-0" />
    </div>
  );
}

/**
 * Skeleton pro news kartu
 */
export function NewsCardSkeleton() {
  return (
    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height="16px" width="85%" />
          <Skeleton variant="text" height="16px" width="60%" />
        </div>
        <Skeleton variant="rectangular" width="60px" height="20px" className="ml-2" />
      </div>
      
      {/* Description */}
      <div className="space-y-1 mb-3">
        <Skeleton variant="text" height="14px" width="100%" />
        <Skeleton variant="text" height="14px" width="80%" />
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" height="12px" width="100px" />
        <Skeleton variant="text" height="12px" width="60px" />
      </div>
    </div>
  );
}

/**
 * Skeleton pro market signal
 */
export function MarketSignalSkeleton() {
  return (
    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="space-y-2">
          <Skeleton variant="text" height="14px" width="80px" />
          <Skeleton variant="text" height="20px" width="120px" />
        </div>
        
        {/* Right side */}
        <div className="text-right space-y-2">
          <Skeleton variant="rectangular" width="60px" height="16px" />
          <Skeleton variant="text" height="12px" width="50px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pro research item
 */
export function ResearchItemSkeleton() {
  return (
    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="space-y-3">
        {/* Title */}
        <Skeleton variant="text" height="16px" width="90%" />
        
        {/* Description */}
        <div className="space-y-1">
          <Skeleton variant="text" height="14px" width="100%" />
          <Skeleton variant="text" height="14px" width="75%" />
        </div>
        
        {/* Tags */}
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width="50px" height="20px" />
          <Skeleton variant="rectangular" width="40px" height="20px" />
          <Skeleton variant="rectangular" width="60px" height="20px" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <Skeleton variant="text" height="12px" width="80px" />
          <Skeleton variant="text" height="12px" width="60px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton page layout s navigací
 */
export function PageSkeleton() {
  return (
    <div className="h-full flex flex-col bg-slate-950 p-4">
      {/* Header */}
      <div className="mb-6">
        <Skeleton variant="text" height="24px" width="200px" className="mb-2" />
        <Skeleton variant="text" height="14px" width="300px" />
      </div>
      
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <Skeleton variant="rectangular" width="60px" height="32px" />
        <Skeleton variant="rectangular" width="80px" height="32px" />
        <Skeleton variant="rectangular" width="70px" height="32px" />
      </div>
      
      {/* Content list */}
      <div className="space-y-3 flex-1">
        {Array.from({ length: 6 }, (_, i) => (
          <PodcastCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}