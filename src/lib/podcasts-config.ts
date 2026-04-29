export interface PodcastConfig {
  id: string;
  name: string;
  category: 'Science' | 'Tech' | 'Business' | 'Czech';
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
  Czech: '#f97316',     // orange-500
};

// Global + Czech podcasts with verified Spotify links
// Tested April 2026
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
    defaultImage: '/podcast-tech.svg',
    priority: 1,
  },
  {
    id: 'a16z',
    name: 'The a16z Show',
    category: 'Tech',
    categoryColor: CATEGORY_COLORS.Tech,
    rssUrl: 'https://feeds.simplecast.com/JGE3yC0V',
    spotifyUrl: 'https://open.spotify.com/show/5bC65RDvs3oxnLyqqvkUYX',
    defaultImage: '/podcast-tech.svg',
    priority: 2,
  },
  
  // === GLOBAL SCIENCE ===
  {
    id: 'huberman',
    name: 'Huberman Lab',
    category: 'Science',
    categoryColor: CATEGORY_COLORS.Science,
    rssUrl: 'https://feeds.megaphone.fm/hubermanlab',
    spotifyUrl: 'https://open.spotify.com/show/79CkJF3UJTHFV8Dse3Oy0P',
    youtubeUrl: 'https://youtube.com/@hubadoratoryatory',
    defaultImage: '/podcast-science.svg',
    priority: 3,
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
    defaultImage: '/podcast-science.svg',
    priority: 4,
  },
  
  // === GLOBAL BUSINESS ===
  {
    id: 'npr-how-built',
    name: 'How I Built This',
    category: 'Business',
    categoryColor: CATEGORY_COLORS.Business,
    rssUrl: 'https://feeds.npr.org/510313/podcast.xml',
    spotifyUrl: 'https://open.spotify.com/show/7xY0pqgkKEQJknNHruRmy7',
    defaultImage: '/podcast-business.svg',
    priority: 5,
  },
  {
    id: 'npr-planet-money',
    name: 'Planet Money',
    category: 'Business',
    categoryColor: CATEGORY_COLORS.Business,
    rssUrl: 'https://feeds.npr.org/510289/podcast.xml',
    spotifyUrl: 'https://open.spotify.com/show/4FYpq3lSeQMAhqNI81O0Cn',
    defaultImage: '/podcast-business.svg',
    priority: 6,
  },
  
  // === CZECH TECH/BUSINESS ===
  {
    id: 'insider-cz',
    name: 'Insider',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/df4a5e8/podcast/rss', // May not work, Spotify is primary
    spotifyUrl: 'https://open.spotify.com/show/0S68hBTED7n5l8H3DiwrHc',
    webUrl: 'https://insider.cz',
    defaultImage: '/podcast-czech.svg',
    priority: 7,
  },
  {
    id: 'na-vlne-ai',
    name: 'Na vlně AI',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/e8c1b7c/podcast/rss', // May not work, Spotify is primary
    spotifyUrl: 'https://open.spotify.com/show/0IE3q115EPI6l8iMe3ZPJR',
    defaultImage: '/podcast-czech.svg',
    priority: 8,
  },
  {
    id: 'ai-v-kostce',
    name: 'AI v kostce',
    category: 'Czech',
    categoryColor: CATEGORY_COLORS.Czech,
    rssUrl: 'https://anchor.fm/s/f1c2a8c/podcast/rss', // May not work, Spotify is primary
    spotifyUrl: 'https://open.spotify.com/show/2LfNywjcsAuKBfqJPVdIMZ',
    defaultImage: '/podcast-czech.svg',
    priority: 9,
  },
];

// Helper functions
export const getPodcastsByCategory = (category: string) => 
  category === 'All' ? PODCASTS : PODCASTS.filter(p => p.category === category);

export const getCategories = () => ['All', 'Tech', 'Science', 'Business', 'Czech'] as const;
