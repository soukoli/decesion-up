export interface PodcastEpisode {
  id: string;
  podcastName: string;
  title: string;
  description: string;
  duration: string;
  pubDate: string;
  imageUrl: string;
  spotifyUrl: string;
  category: string;
  categoryColor: string;
}

export interface EconomicSignal {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  detail: string;
  source: string;
  updatedAt: string;
}

export interface TechTrend {
  id: string;
  title: string;
  url: string;
  score: number;
  comments: number;
  source: 'hackernews' | 'devto' | 'github';
  timeAgo: string;
}

export interface WorldNews {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: 'world' | 'europe' | 'business' | 'science' | 'geopolitics';
  publishedAt: string;
  imageUrl?: string;
}

export interface GlobalHotspot {
  id: string;
  lat: number;
  lng: number;
  country: string;
  region: string;
  eventCount: number;
  topEvent: string;
  category: 'conflict' | 'protest' | 'disaster' | 'politics' | 'economy';
  intensity: number; // 1-10 scale
  sources: string[];
  url?: string;
}

export interface AIResearch {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  url: string;
  category: string;
  publishedAt: string;
}

export interface DashboardData {
  podcasts: PodcastEpisode[];
  economic: EconomicSignal[];
  trends: TechTrend[];
  news: WorldNews[];
  hotspots: GlobalHotspot[];
  research: AIResearch[];
  lastUpdated: string;
}
