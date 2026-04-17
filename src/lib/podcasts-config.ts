export interface PodcastConfig {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  rssUrl: string;
  spotifyShowUrl: string;
  defaultImage: string;
  priority: number;
}

// Using verified working RSS feeds
export const PODCASTS: PodcastConfig[] = [
  // === MAIN 4 (always visible) ===
  {
    id: 'bbc-global',
    name: 'BBC Global News Podcast',
    category: 'World',
    categoryColor: '#b8d4e3',
    rssUrl: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss',
    spotifyShowUrl: 'https://open.spotify.com/show/5WCcHgPeBwHjksxsmHqD20',
    defaultImage: '/podcast-world.svg',
    priority: 1,
  },
  {
    id: 'ted-talks',
    name: 'TED Talks Daily',
    category: 'Ideas',
    categoryColor: '#ffd6a5',
    rssUrl: 'https://feeds.feedburner.com/tedtalks_audio',
    spotifyShowUrl: 'https://open.spotify.com/show/1VXcH8QHkjRcTCEd88U3ti',
    defaultImage: '/podcast-ideas.svg',
    priority: 2,
  },
  {
    id: 'lex-fridman',
    name: 'Lex Fridman Podcast',
    category: 'AI/Tech',
    categoryColor: '#caffbf',
    rssUrl: 'https://lexfridman.com/feed/podcast/',
    spotifyShowUrl: 'https://open.spotify.com/show/2MAi0BvDc6GTFvKFPXnkCL',
    defaultImage: '/podcast-ai.svg',
    priority: 3,
  },
  {
    id: 'a16z',
    name: 'a16z Podcast',
    category: 'Tech/VC',
    categoryColor: '#e4d4f4',
    rssUrl: 'https://feeds.simplecast.com/JGE3yC0V',
    spotifyShowUrl: 'https://open.spotify.com/show/5bC65RDvs3oxnLyqqvkUYX',
    defaultImage: '/podcast-tech.svg',
    priority: 4,
  },
  // === EXPANDABLE (show more) ===
  {
    id: 'huberman',
    name: 'Huberman Lab',
    category: 'Science',
    categoryColor: '#a0c4ff',
    rssUrl: 'https://feeds.megaphone.fm/hubermanlab',
    spotifyShowUrl: 'https://open.spotify.com/show/79CkJF3UJTHFV8Dse3Ez0S',
    defaultImage: '/podcast-science.svg',
    priority: 5,
  },
  {
    id: 'daily-stoic',
    name: 'The Daily Stoic',
    category: 'Philosophy',
    categoryColor: '#ffc6ff',
    rssUrl: 'https://rss.art19.com/the-daily-stoic',
    spotifyShowUrl: 'https://open.spotify.com/show/7fY99FB4LoXOvXpFPrL3Oe',
    defaultImage: '/podcast-philosophy.svg',
    priority: 6,
  },
];

export const getMainPodcasts = () => PODCASTS.filter(p => p.priority <= 4);
export const getExpandablePodcasts = () => PODCASTS.filter(p => p.priority > 4);
