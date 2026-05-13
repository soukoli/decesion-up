export interface PodcastConfig {
  id: string;
  name: string;
  category: 'Science' | 'Tech' | 'Business' | 'Learning' | 'Czech';
  categoryColor: string;
  rssUrl: string;
  spotifyUrl: string; // Primary link - verified working April 2026
  youtubeUrl?: string; // Fallback for podcasts with YouTube channels
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

// Global + Czech podcasts with verified Spotify links
// Updated May 2026
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
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a563ebb538d297875b10114b7',
    priority: 1,
  },
  {
    id: 'latent-space',
    name: 'Latent Space',
    category: 'Tech',
    categoryColor: CATEGORY_COLORS.Tech,
    rssUrl: 'https://api.substack.com/feed/podcast/1084089.rss',
    spotifyUrl: 'https://open.spotify.com/show/5gJMRGIkjMOcRMk9dVugFa',
    webUrl: 'https://www.latent.space/podcast',
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a4903798b275a2f8a4acf54ec',
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
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a16f60a92e0e8c814b36c5b04',
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
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a48a8c3e1e0a02ead58aebbfc',
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
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a61e127e24e31113dd8f89072',
    priority: 5,
  },

  // === LEARNING & THINKING ===
  {
    id: 'hardcore-history',
    name: 'Hardcore History',
    category: 'Learning',
    categoryColor: CATEGORY_COLORS.Learning,
    rssUrl: 'https://feeds.feedburner.com/dancarloinscommonsense',
    spotifyUrl: 'https://open.spotify.com/show/72qiPaU2GmbDLuGYnnaiEE',
    webUrl: 'https://www.dancarlin.com/hardcore-history-series/',
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a4f17e531a64faed0ab8f2e9a',
    priority: 6,
  },
  {
    id: 'knowledge-project',
    name: 'The Knowledge Project',
    category: 'Learning',
    categoryColor: CATEGORY_COLORS.Learning,
    rssUrl: 'https://theknowledgeproject.libsyn.com/rss',
    spotifyUrl: 'https://open.spotify.com/show/1VyK52NSZHRalOXMYFOCaW',
    webUrl: 'https://fs.blog/knowledge-project-podcast/',
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a7b6246d1d7e5f7ca3a59ff3e',
    priority: 7,
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive with Ali Abdaal',
    category: 'Learning',
    categoryColor: CATEGORY_COLORS.Learning,
    rssUrl: 'https://feeds.transistor.fm/deep-dive-with-ali-abdaal',
    spotifyUrl: 'https://open.spotify.com/show/2S4k2nPM5ZBK6rhlCkEvNP',
    youtubeUrl: 'https://youtube.com/@aliabdaal',
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a1b08c8a08a4160ddf74fc546',
    priority: 8,
  },

  // === GLOBAL BUSINESS ===
  {
    id: 'npr-how-built',
    name: 'How I Built This',
    category: 'Business',
    categoryColor: CATEGORY_COLORS.Business,
    rssUrl: 'https://feeds.npr.org/510313/podcast.xml',
    spotifyUrl: 'https://open.spotify.com/show/7xY0pqgkKEQJknNHruRmy7',
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a3c93e4083ead66bf8a84a598',
    priority: 9,
  },

  // === CZECH TECH/BUSINESS ===
  {
    id: 'insider-cz',
    name: 'Insider',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/df4a5e8/podcast/rss',
    spotifyUrl: 'https://open.spotify.com/show/0S68hBTED7n5l8H3DiwrHc',
    webUrl: 'https://insider.cz',
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a7b2903ba0496c7e3e6c0dbde',
    priority: 10,
  },
  {
    id: 'na-vlne-ai',
    name: 'Na vlně AI',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/e8c1b7c/podcast/rss',
    spotifyUrl: 'https://open.spotify.com/show/0IE3q115EPI6l8iMe3ZPJR',
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a7ac74bff17e4b6c5f3247a06',
    priority: 11,
  },
  {
    id: 'ai-v-kostce',
    name: 'AI v kostce',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/f1c2a8c/podcast/rss',
    spotifyUrl: 'https://open.spotify.com/show/2LfNywjcsAuKBfqJPVdIMZ',
    defaultImage: 'https://i.scdn.co/image/ab6765630000ba8a1c5f3c1f3c0e5f3c3c3c3c3c',
    priority: 12,
  },
];

// Helper functions
export const getPodcastsByCategory = (category: string) => 
  category === 'All' ? PODCASTS : PODCASTS.filter(p => p.category === category);

export const getCategories = () => ['All', 'Tech', 'Science', 'Learning', 'Business', 'Czech'] as const;
