export interface PodcastEpisode {
  id: string;
  podcastName: string;
  title: string;
  description: string;
  duration: string;
  pubDate: string;
  imageUrl: string;
  spotifyUrl: string;
  youtubeUrl?: string;
  webUrl?: string;
  category: string;
  categoryColor: string;
}

export interface SchoolArticle {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  imageUrl: string | null;
  articleUrl: string;
  category: 'Novinky' | 'Družina';
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

// New unified Market Signal type for the Markets section
export interface MarketSignal {
  id: string;
  name: string;
  symbol?: string;
  category: 'currency' | 'index' | 'macro' | 'rate' | 'crypto';
  value: number;
  valueFormatted: string;
  valueCZK?: number;
  valueCZKFormatted?: string;
  change: number | null;
  changePercent: number | null;
  trend: 'up' | 'down' | 'stable';
  sparkline?: number[];
  explanation: string;
  source: string;
  sourceUrl: string;
  updatedAt: string;
  country?: string;
  unit?: string;
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

export interface TrendingTopic {
  id: string;
  title: string;
  traffic: string;
  trafficNumber: number;
  url: string;
  newsItems: {
    title: string;
    url: string;
    source: string;
  }[];
  relatedQueries: string[];
  imageUrl?: string;
  pubDate: string;
}

export interface StockDataPoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockIndex {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  historicalData: StockDataPoint[];
}

export interface AICommunity {
  id: string;
  name: string;
  nameCS: string;
  description: string;
  descriptionCS: string;
  type: 'podcast' | 'newsletter' | 'community' | 'youtube';
  url: string;
  language: 'cs' | 'en' | 'both';
  author?: string;
  frequency?: string;
  frequencyCS?: string;
  imageUrl?: string;
  subscribers?: string;
  topics: string[];
  topicsCS: string[];
}

export interface DashboardData {
  podcasts: PodcastEpisode[];
  economic: EconomicSignal[];
  markets: MarketSignal[];
  trends: TechTrend[];
  news: WorldNews[];
  hotspots: GlobalHotspot[];
  research: AIResearch[];
  trending: TrendingTopic[];
  stocks: StockIndex[];
  aiCommunities: AICommunity[];
  lastUpdated: string;
}
