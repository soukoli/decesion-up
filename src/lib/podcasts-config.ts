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
    priority: 7,
    region: 'global',
    language: 'en',
  },
  {
    id: 'ted-talks-daily',
    name: 'TED Talks Daily',
    category: 'Ideas',
    categoryColor: '#eb0028',
    rssUrl: 'https://feeds.feedburner.com/TEDTalks_audio',
    spotifyShowUrl: 'https://open.spotify.com/show/1VXcH8QHkjRcTCEd88U3ti',
    appleUrl: 'https://podcasts.apple.com/podcast/ted-talks-daily/id160904630',
    webUrl: 'https://www.ted.com/podcasts/ted-talks-daily',
    defaultImage: '/podcast-ideas.svg',
    priority: 6,
    region: 'global',
    language: 'en',
  },
];

// Czech podcasts - Spotify primary, RSS feeds are unreliable
// Verified Spotify show IDs - April 2026
// Note: RSS feeds for Czech podcasts are notoriously unstable, so we use
// webUrl/spotifyUrl as primary links and skip RSS fetching for these
export const CZECH_PODCASTS: PodcastConfig[] = [
  {
    id: 'vinohradska',
    name: 'Vinohradská 12',
    category: 'Zprávy',
    categoryColor: '#ff6b6b',
    rssUrl: '', // RSS unreliable, use direct links
    spotifyShowUrl: 'https://open.spotify.com/show/5cJ0lQOiVLvdleoqopdRBL',
    appleUrl: 'https://podcasts.apple.com/cz/podcast/vinohradsk%C3%A1-12/id1460167711',
    webUrl: 'https://www.mujrozhlas.cz/vinohradska-12',
    defaultImage: '/images/podcasts/vinohradska.jpg',
    priority: 1,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'kecy-politika',
    name: 'Kecy a politika',
    category: 'Politika',
    categoryColor: '#ffd93d',
    rssUrl: '', // RSS unreliable
    spotifyShowUrl: 'https://open.spotify.com/show/0pMqFkIBswgY2TmqtIBq5f',
    appleUrl: 'https://podcasts.apple.com/cz/podcast/kecy-a-politika/id1534349444',
    webUrl: 'https://kecyapolitika.cz',
    defaultImage: '/images/podcasts/kecy.jpg',
    priority: 2,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'studio-n',
    name: 'Studio N',
    category: 'Zprávy',
    categoryColor: '#74c0fc',
    rssUrl: '', // Deník N RSS unreliable
    spotifyShowUrl: 'https://open.spotify.com/show/0WYmGzquv94cND8NL9BPGA',
    appleUrl: 'https://podcasts.apple.com/cz/podcast/studio-n/id1454631401',
    webUrl: 'https://denikn.cz/studio-n/',
    defaultImage: '/images/podcasts/studio-n.jpg',
    priority: 3,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'imperativ',
    name: 'Imperativ',
    category: 'Tech',
    categoryColor: '#a78bfa',
    rssUrl: '', // RSS unreliable
    spotifyShowUrl: 'https://open.spotify.com/show/4qVyYfkfHvQPidOQhwqLqO',
    appleUrl: 'https://podcasts.apple.com/cz/podcast/imperativ/id1536816148',
    webUrl: 'https://imperativ.cz',
    defaultImage: '/images/podcasts/imperativ.jpg',
    priority: 4,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'uspesna-firma',
    name: 'Úspěšná firma',
    category: 'Byznys',
    categoryColor: '#4ecdc4',
    rssUrl: '', // RSS unreliable
    spotifyShowUrl: 'https://open.spotify.com/show/3mKcuCoqVhlQPDFJlLVxMb',
    appleUrl: 'https://podcasts.apple.com/cz/podcast/%C3%BAsp%C4%9B%C5%A1n%C3%A1-firma/id1502556553',
    webUrl: 'https://www.uspesnafirma.cz/podcast',
    defaultImage: '/images/podcasts/uspesna-firma.jpg',
    priority: 5,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'behind-the-scenes',
    name: 'Behind The Scenes',
    category: 'Byznys',
    categoryColor: '#ff85a1',
    rssUrl: '', // RSS unreliable
    spotifyShowUrl: 'https://open.spotify.com/show/5aDafq7ePV3tnqr7fWHdTH',
    appleUrl: 'https://podcasts.apple.com/cz/podcast/behind-the-scenes/id1532508954',
    defaultImage: '/images/podcasts/bts.jpg',
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
