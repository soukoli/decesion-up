export interface PodcastConfig {
  id: string;
  name: string;
  category: 'News' | 'Science' | 'Tech' | 'Business' | 'Ideas';
  categoryColor: string;
  rssUrl: string;
  appleUrl: string; // Primary link - verified working
  webUrl?: string;
  defaultImage: string;
  priority: number;
}

// Category colors for filtering UI
export const CATEGORY_COLORS: Record<string, string> = {
  News: '#f87171',      // red-400
  Science: '#60a5fa',   // blue-400
  Tech: '#a78bfa',      // violet-400
  Business: '#4ade80',  // green-400
  Ideas: '#fbbf24',     // amber-400
};

// Global podcasts with verified working RSS feeds and Apple Podcasts links
// Tested April 2026
export const PODCASTS: PodcastConfig[] = [
  {
    id: 'bbc-global',
    name: 'BBC Global News',
    category: 'News',
    categoryColor: CATEGORY_COLORS.News,
    rssUrl: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss',
    appleUrl: 'https://podcasts.apple.com/podcast/global-news-podcast/id135067274',
    defaultImage: '/podcast-news.svg',
    priority: 1,
  },
  {
    id: 'nyt-daily',
    name: 'The Daily',
    category: 'News',
    categoryColor: CATEGORY_COLORS.News,
    rssUrl: 'https://feeds.simplecast.com/54nAGcIl',
    appleUrl: 'https://podcasts.apple.com/podcast/the-daily/id1200361736',
    defaultImage: '/podcast-news.svg',
    priority: 2,
  },
  {
    id: 'huberman',
    name: 'Huberman Lab',
    category: 'Science',
    categoryColor: CATEGORY_COLORS.Science,
    rssUrl: 'https://feeds.megaphone.fm/hubermanlab',
    appleUrl: 'https://podcasts.apple.com/podcast/huberman-lab/id1545953110',
    defaultImage: '/podcast-science.svg',
    priority: 3,
  },
  {
    id: 'ted-talks-daily',
    name: 'TED Talks Daily',
    category: 'Ideas',
    categoryColor: CATEGORY_COLORS.Ideas,
    rssUrl: 'https://feeds.feedburner.com/TEDTalks_audio',
    appleUrl: 'https://podcasts.apple.com/podcast/ted-talks-daily/id160904630',
    webUrl: 'https://www.ted.com/podcasts/ted-talks-daily',
    defaultImage: '/podcast-ideas.svg',
    priority: 4,
  },
  {
    id: 'npr-how-built',
    name: 'How I Built This',
    category: 'Business',
    categoryColor: CATEGORY_COLORS.Business,
    rssUrl: 'https://feeds.npr.org/510313/podcast.xml',
    appleUrl: 'https://podcasts.apple.com/podcast/how-i-built-this-with-guy-raz/id1150510297',
    defaultImage: '/podcast-business.svg',
    priority: 5,
  },
  {
    id: 'npr-planet-money',
    name: 'Planet Money',
    category: 'Business',
    categoryColor: CATEGORY_COLORS.Business,
    rssUrl: 'https://feeds.npr.org/510289/podcast.xml',
    appleUrl: 'https://podcasts.apple.com/podcast/planet-money/id290783428',
    defaultImage: '/podcast-business.svg',
    priority: 6,
  },
  {
    id: 'lex-fridman',
    name: 'Lex Fridman Podcast',
    category: 'Science',
    categoryColor: CATEGORY_COLORS.Science,
    rssUrl: 'https://lexfridman.com/feed/podcast/',
    appleUrl: 'https://podcasts.apple.com/podcast/lex-fridman-podcast/id1434243584',
    defaultImage: '/podcast-science.svg',
    priority: 7,
  },
  {
    id: 'a16z',
    name: 'a16z Podcast',
    category: 'Tech',
    categoryColor: CATEGORY_COLORS.Tech,
    rssUrl: 'https://feeds.simplecast.com/JGE3yC0V',
    appleUrl: 'https://podcasts.apple.com/podcast/a16z-podcast/id842818711',
    defaultImage: '/podcast-tech.svg',
    priority: 8,
  },
];

// Helper functions
export const getPodcastsByCategory = (category: string) => 
  category === 'All' ? PODCASTS : PODCASTS.filter(p => p.category === category);

export const getCategories = () => ['All', 'News', 'Science', 'Tech', 'Business', 'Ideas'] as const;
