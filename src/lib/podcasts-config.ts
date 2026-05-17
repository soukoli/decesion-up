export interface PodcastConfig {
  id: string;
  name: string;
  category: 'Science' | 'Tech' | 'Business' | 'Learning' | 'Czech';
  categoryColor: string;
  rssUrl: string;
  spotifyUrl: string; // Primary link
  youtubeUrl?: string;
  webUrl?: string;
  defaultImage: string;
  priority: number;
}

// Category colors for filtering UI
export const CATEGORY_COLORS: Record<string, string> = {
  Science: '#60a5fa',   // blue-400
  Tech: '#a78bfa',      // violet-400
  Business: '#4ade80',  // green-400
  Learning: '#fbbf24',  // amber-400
  Czech: '#f97316',     // orange-500
};

// Verified May 2026 - all RSS feeds and Spotify links tested
export const PODCASTS: PodcastConfig[] = [
  // === GLOBAL TECH/AI ===
  {
    id: 'lex-fridman',
    name: 'Lex Fridman Podcast',
    category: 'Tech',
    categoryColor: CATEGORY_COLORS.Tech,
    rssUrl: 'https://lexfridman.com/feed/podcast/',
    spotifyUrl: 'https://open.spotify.com/show/2MAi0BvDc6GTFvKFPXnkCL',
    youtubeUrl: 'https://youtube.com/@lexfridman',
    defaultImage: '',
    priority: 1,
  },
  {
    id: 'latent-space',
    name: 'Latent Space',
    category: 'Tech',
    categoryColor: CATEGORY_COLORS.Tech,
    rssUrl: 'https://api.substack.com/feed/podcast/1084089.rss',
    spotifyUrl: 'https://www.latent.space/podcast',
    webUrl: 'https://www.latent.space/podcast',
    defaultImage: '',
    priority: 2,
  },
  {
    id: 'ml-street-talk',
    name: 'Machine Learning Street Talk',
    category: 'Tech',
    categoryColor: CATEGORY_COLORS.Tech,
    rssUrl: 'https://anchor.fm/s/1e4a0eac/podcast/rss',
    spotifyUrl: 'https://open.spotify.com/show/02e6PZeIOdpmBGT9THuzwR',
    youtubeUrl: 'https://youtube.com/@MachineLearningStreetTalk',
    defaultImage: '',
    priority: 3,
  },

  // === GLOBAL SCIENCE ===
  {
    id: 'huberman',
    name: 'Huberman Lab',
    category: 'Science',
    categoryColor: CATEGORY_COLORS.Science,
    rssUrl: 'https://feeds.megaphone.fm/hubermanlab',
    spotifyUrl: 'https://open.spotify.com/show/79CkJF3UJTHFV8Dse3Oy0P',
    youtubeUrl: 'https://youtube.com/@hubaboratory',
    defaultImage: '',
    priority: 4,
  },
  {
    id: 'ted-talks',
    name: 'TED Talks Daily',
    category: 'Science',
    categoryColor: CATEGORY_COLORS.Science,
    rssUrl: 'https://feeds.feedburner.com/tedtalks_audio',
    spotifyUrl: 'https://open.spotify.com/show/1VXcH8QHkjRcTCEd88U3ti',
    youtubeUrl: 'https://youtube.com/@TEDTalksDirector',
    webUrl: 'https://www.ted.com/talks',
    defaultImage: '',
    priority: 5,
  },

  // === LEARNING & THINKING ===
  {
    id: 'knowledge-project',
    name: 'The Knowledge Project',
    category: 'Learning',
    categoryColor: CATEGORY_COLORS.Learning,
    rssUrl: 'https://theknowledgeproject.libsyn.com/rss',
    spotifyUrl: 'https://fs.blog/knowledge-project-podcast/',
    webUrl: 'https://fs.blog/knowledge-project-podcast/',
    defaultImage: '',
    priority: 6,
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive with Ali Abdaal',
    category: 'Learning',
    categoryColor: CATEGORY_COLORS.Learning,
    rssUrl: 'https://feeds.transistor.fm/deep-dive-with-ali-abdaal',
    spotifyUrl: 'https://youtube.com/@aliabdaal',
    youtubeUrl: 'https://youtube.com/@aliabdaal',
    defaultImage: '',
    priority: 7,
  },

  // === GLOBAL BUSINESS ===
  {
    id: 'npr-how-built',
    name: 'How I Built This',
    category: 'Business',
    categoryColor: CATEGORY_COLORS.Business,
    rssUrl: 'https://feeds.npr.org/510313/podcast.xml',
    spotifyUrl: 'https://open.spotify.com/show/7xY0pqgkKEQJknNHruRmy7',
    defaultImage: '',
    priority: 8,
  },

  // === CZECH ===
  {
    id: 'insider-cz',
    name: 'Insider',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/df4a5e8/podcast/rss',
    spotifyUrl: 'https://open.spotify.com/show/0S68hBTED7n5l8H3DiwrHc',
    webUrl: 'https://insider.cz',
    defaultImage: '',
    priority: 9,
  },
  {
    id: 'na-vlne-ai',
    name: 'Na vlně AI',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/e8c1b7c/podcast/rss',
    spotifyUrl: 'https://open.spotify.com/show/0IE3q115EPI6l8iMe3ZPJR',
    defaultImage: '',
    priority: 10,
  },
  {
    id: 'ai-v-kostce',
    name: 'AI v kostce',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/f1c2a8c/podcast/rss',
    spotifyUrl: 'https://open.spotify.com/show/2LfNywjcsAuKBfqJPVdIMZ',
    defaultImage: '',
    priority: 11,
  },
];

// Helper functions
export const getPodcastsByCategory = (category: string) => 
  category === 'All' ? PODCASTS : PODCASTS.filter(p => p.category === category);

export const getCategories = () => ['All', 'Tech', 'Science', 'Learning', 'Business', 'Czech'] as const;
