import { describe, it, expect } from 'vitest';
import { formatRelativeTime, isFresh, isFreshFromTimeAgo } from '@/lib/utils';

describe('formatRelativeTime', () => {
  it('returns "teď" for less than 1 minute ago', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('teď');
  });

  it('returns minutes for < 60 min', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('5m');
  });

  it('returns hours for < 24h', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('3h');
  });

  it('returns days for < 7d', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('2d');
  });

  it('returns weeks for >= 7d', () => {
    const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('2w');
  });
});

describe('isFresh', () => {
  it('returns true for dates less than 24h old', () => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(isFresh(date)).toBe(true);
  });

  it('returns false for dates more than 24h old', () => {
    const date = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    expect(isFresh(date)).toBe(false);
  });

  it('returns true for current time', () => {
    expect(isFresh(new Date().toISOString())).toBe(true);
  });
});

describe('isFreshFromTimeAgo', () => {
  it('returns true for "X minutes ago"', () => {
    expect(isFreshFromTimeAgo('5 minutes ago')).toBe(true);
  });

  it('returns true for "X hours ago"', () => {
    expect(isFreshFromTimeAgo('3 hours ago')).toBe(true);
  });

  it('returns false for "X days ago"', () => {
    expect(isFreshFromTimeAgo('2 days ago')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isFreshFromTimeAgo('')).toBe(false);
  });

  it('handles "min" abbreviation', () => {
    expect(isFreshFromTimeAgo('5 min ago')).toBe(true);
  });
});
