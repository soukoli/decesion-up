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

export interface DashboardData {
  podcasts: PodcastEpisode[];
  economic: EconomicSignal[];
  trends: TechTrend[];
  lastUpdated: string;
}
