export interface PodcastConfig {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  rssUrl: string;
  spotifyShowUrl: string;
  appleUrl?: string;
  webUrl?: string;
  defaultImage: string;
  priority: number;
  region: 'global' | 'czech';
  language: 'en' | 'cs';
}

// Global podcasts - verified working RSS feeds (tested April 2026)
export const GLOBAL_PODCASTS: PodcastConfig[] = [
  {
    id: 'bbc-global',
    name: 'BBC Global News',
    category: 'News',
    categoryColor: '#b8d4e3',
    rssUrl: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss',
    spotifyShowUrl: 'https://open.spotify.com/show/5WCcHgPeBwHjksxsmHqD20',
    appleUrl: 'https://podcasts.apple.com/podcast/global-news-podcast/id135067274',
    defaultImage: '/podcast-world.svg',
    priority: 1,
    region: 'global',
    language: 'en',
  },
  {
    id: 'huberman',
    name: 'Huberman Lab',
    category: 'Science',
    categoryColor: '#a0c4ff',
    rssUrl: 'https://feeds.megaphone.fm/hubermanlab',
    spotifyShowUrl: 'https://open.spotify.com/show/79CkJF3UJTHFV8Dse3Ez0S',
    appleUrl: 'https://podcasts.apple.com/podcast/huberman-lab/id1545953110',
    defaultImage: '/podcast-science.svg',
    priority: 2,
    region: 'global',
    language: 'en',
  },
  {
    id: 'nyt-daily',
    name: 'The Daily (NYT)',
    category: 'News',
    categoryColor: '#f8f8f8',
    rssUrl: 'https://feeds.simplecast.com/54nAGcIl',
    spotifyShowUrl: 'https://open.spotify.com/show/3IM0lmZxpFAY7CwMuv9H4g',
    appleUrl: 'https://podcasts.apple.com/podcast/the-daily/id1200361736',
    defaultImage: '/podcast-news.svg',
    priority: 3,
    region: 'global',
    language: 'en',
  },
  {
    id: 'npr-how-built',
    name: 'How I Built This',
    category: 'Business',
    categoryColor: '#caffbf',
    rssUrl: 'https://feeds.npr.org/510313/podcast.xml',
    spotifyShowUrl: 'https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun',
    appleUrl: 'https://podcasts.apple.com/podcast/how-i-built-this-with-guy-raz/id1150510297',
    defaultImage: '/podcast-business.svg',
    priority: 4,
    region: 'global',
    language: 'en',
  },
  {
    id: 'npr-planet-money',
    name: 'Planet Money',
    category: 'Economics',
    categoryColor: '#ffd6a5',
    rssUrl: 'https://feeds.npr.org/510289/podcast.xml',
    spotifyShowUrl: 'https://open.spotify.com/show/4FYpq3lSeQMAhqNI81O0Cn',
    appleUrl: 'https://podcasts.apple.com/podcast/planet-money/id290783428',
    defaultImage: '/podcast-business.svg',
    priority: 5,
    region: 'global',
    language: 'en',
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    category: 'Tech',
    categoryColor: '#e4d4f4',
    rssUrl: 'https://feeds.feedburner.com/Techcrunch',
    spotifyShowUrl: 'https://open.spotify.com/show/3ZHm8UY2pVNVfzPjHR9LbZ',
    defaultImage: '/podcast-tech.svg',
    priority: 6,
    region: 'global',
    language: 'en',
  },
];

// Czech podcasts - Spotify primary (RSS feeds unreliable, fallback data used)
export const CZECH_PODCASTS: PodcastConfig[] = [
  {
    id: 'vinohradska',
    name: 'Vinohradská 12',
    category: 'Zprávy',
    categoryColor: '#ff6b6b',
    rssUrl: 'https://api.rozhlas.cz/data/v2/podcast/show/vinohradska-12.rss',
    spotifyShowUrl: 'https://open.spotify.com/show/5cJ0lQOiVLvdleoqopdRBL',
    appleUrl: 'https://podcasts.apple.com/cz/podcast/vinohradsk%C3%A1-12/id1460167711',
    webUrl: 'https://www.mujrozhlas.cz/vinohradska-12',
    defaultImage: '/podcast-news.svg',
    priority: 1,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'prostor-x',
    name: 'Prostor X',
    category: 'Rozhovory',
    categoryColor: '#ffd93d',
    rssUrl: 'https://anchor.fm/s/d9b8e54/podcast/rss',
    spotifyShowUrl: 'https://open.spotify.com/show/3zLWvIqBP0iY5keFOcPGGG',
    defaultImage: '/podcast-interview.svg',
    priority: 2,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'dvacet-minut',
    name: '20 minut Radiožurnálu',
    category: 'Zprávy',
    categoryColor: '#74c0fc',
    rssUrl: 'https://api.rozhlas.cz/data/v2/podcast/show/dvacet-minut-radiozurnalu.rss',
    spotifyShowUrl: 'https://open.spotify.com/show/5fYHSJpRLsVV40rvMNlkGK',
    webUrl: 'https://www.mujrozhlas.cz/dvacet-minut-radiozurnalu',
    defaultImage: '/podcast-news.svg',
    priority: 3,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'cnews',
    name: 'CNEWS Podcast',
    category: 'Tech',
    categoryColor: '#a78bfa',
    rssUrl: 'https://anchor.fm/s/10e14c54/podcast/rss',
    spotifyShowUrl: 'https://open.spotify.com/show/1Z5Ld6MgTHvVlPCLH0PXlC',
    webUrl: 'https://www.cnews.cz/podcast/',
    defaultImage: '/podcast-tech.svg',
    priority: 4,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'hn-byznys',
    name: 'HN Byznys',
    category: 'Byznys',
    categoryColor: '#4ecdc4',
    rssUrl: 'https://anchor.fm/s/57bbc888/podcast/rss',
    spotifyShowUrl: 'https://open.spotify.com/show/0R5bQdAWIvNTrWZOPPFCjA',
    webUrl: 'https://hn.cz/podcast',
    defaultImage: '/podcast-business.svg',
    priority: 5,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'wave',
    name: 'Wave Podcast',
    category: 'Lifestyle',
    categoryColor: '#ff85a1',
    rssUrl: 'https://anchor.fm/s/49c2a4d8/podcast/rss',
    spotifyShowUrl: 'https://open.spotify.com/show/2RiJpkBDlzBkVnxO5LfOiE',
    defaultImage: '/podcast-lifestyle.svg',
    priority: 6,
    region: 'czech',
    language: 'cs',
  },
];

// Combined list for backward compatibility
export const PODCASTS: PodcastConfig[] = [...GLOBAL_PODCASTS, ...CZECH_PODCASTS];

export const getGlobalPodcasts = () => GLOBAL_PODCASTS;
export const getCzechPodcasts = () => CZECH_PODCASTS;
export const getMainPodcasts = () => GLOBAL_PODCASTS.filter(p => p.priority <= 4);
export const getExpandablePodcasts = () => GLOBAL_PODCASTS.filter(p => p.priority > 4);
