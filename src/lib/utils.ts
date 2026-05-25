/**
 * Format a date string as relative time (e.g. "5m", "2h", "1d")
 */
export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'teď';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

/**
 * Check if a date string is less than 24h old
 */
export function isFresh(dateStr: string): boolean {
  return (Date.now() - new Date(dateStr).getTime()) < 24 * 60 * 60 * 1000;
}

/**
 * Parse "X hours ago" / "X minutes ago" style strings to determine freshness
 */
export function isFreshFromTimeAgo(timeAgo: string): boolean {
  if (!timeAgo) return false;
  const lower = timeAgo.toLowerCase();
  if (lower.includes('minute') || lower.includes('min')) return true;
  if (lower.includes('hour')) return true;
  return false;
}
