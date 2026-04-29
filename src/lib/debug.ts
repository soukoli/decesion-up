/**
 * Debug utility pro development/production logging
 */

const IS_DEV = process.env.NODE_ENV === 'development';

export const debugLog = {
  log: IS_DEV ? console.log.bind(console) : () => {},
  warn: IS_DEV ? console.warn.bind(console) : () => {},
  info: IS_DEV ? console.info.bind(console) : () => {},
  // Error vždy logovat
  error: console.error.bind(console),
};

/**
 * Performance timer for development
 */
export class DebugTimer {
  private startTime: number = 0;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  start(): void {
    if (IS_DEV) {
      this.startTime = performance.now();
    }
  }

  end(): number {
    if (!IS_DEV) return 0;
    
    const duration = performance.now() - this.startTime;
    debugLog.log(`⏱️ ${this.name}: ${duration.toFixed(2)}ms`);
    return duration;
  }
}

export default debugLog;