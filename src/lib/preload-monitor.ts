'use client';

import debugLog from './debug';

/**
 * Utility pro monitoring a debug preloading performance
 */
export class PreloadMonitor {
  private static instance: PreloadMonitor;
  private metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();

  static getInstance(): PreloadMonitor {
    if (!PreloadMonitor.instance) {
      PreloadMonitor.instance = new PreloadMonitor();
    }
    return PreloadMonitor.instance;
  }

  startTimer(name: string): void {
    this.startTimes.set(name, performance.now());
  }

  endTimer(name: string): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      debugLog.warn(`Timer "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(name, duration);
    this.startTimes.delete(name);
    
    debugLog.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  logSummary(): void {
    debugLog.log('📊 Preload Performance Summary:');
    debugLog.log(this.getAllMetrics());
  }

  clear(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Globální instance pro snadné použití
export const preloadMonitor = PreloadMonitor.getInstance();