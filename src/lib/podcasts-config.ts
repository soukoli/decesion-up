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

// Global podcasts - verified working RSS feeds
export const GLOBAL_PODCASTS: PodcastConfig[] = [
  {
    id: 'bbc-global',
    name: 'BBC Global News Podcast',
    category: 'World',
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
    id: 'all-in',
    name: 'All-In Podcast',
    category: 'Tech/VC',
    categoryColor: '#ffd6a5',
    rssUrl: 'https://feeds.megaphone.fm/all-in-with-chamath-jason-sacks-friedberg',
    spotifyShowUrl: 'https://open.spotify.com/show/2IqXAVFR4e0Bmyjsdc8QzF',
    appleUrl: 'https://podcasts.apple.com/podcast/all-in-with-chamath-jason-sacks-friedberg/id1502871393',
    defaultImage: '/podcast-tech.svg',
    priority: 3,
    region: 'global',
    language: 'en',
  },
  {
    id: 'acquired',
    name: 'Acquired',
    category: 'Business',
    categoryColor: '#e4d4f4',
    rssUrl: 'https://feeds.megaphone.fm/acquired',
    spotifyShowUrl: 'https://open.spotify.com/show/7Fj0XEuUQLUqoMZQdsLXqp',
    appleUrl: 'https://podcasts.apple.com/podcast/acquired/id1050462261',
    defaultImage: '/podcast-business.svg',
    priority: 4,
    region: 'global',
    language: 'en',
  },
  {
    id: 'daily-nyt',
    name: 'The Daily (NYT)',
    category: 'News',
    categoryColor: '#f8f8f8',
    rssUrl: 'https://feeds.simplecast.com/54nAGcIl',
    spotifyShowUrl: 'https://open.spotify.com/show/3IM0lmZxpFAY7CwMuv9H4g',
    appleUrl: 'https://podcasts.apple.com/podcast/the-daily/id1200361736',
    defaultImage: '/podcast-news.svg',
    priority: 5,
    region: 'global',
    language: 'en',
  },
  {
    id: 'how-i-built',
    name: 'How I Built This',
    category: 'Business',
    categoryColor: '#caffbf',
    rssUrl: 'https://feeds.npr.org/510313/podcast.xml',
    spotifyShowUrl: 'https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun',
    appleUrl: 'https://podcasts.apple.com/podcast/how-i-built-this-with-guy-raz/id1150510297',
    defaultImage: '/podcast-business.svg',
    priority: 6,
    region: 'global',
    language: 'en',
  },
];

// Czech podcasts - using Spotify links as primary (RSS feeds are unreliable)
export const CZECH_PODCASTS: PodcastConfig[] = [
  {
    id: 'vinohradska-12',
    name: 'Vinohradská 12',
    category: 'Zprávy',
    categoryColor: '#ff6b6b',
    rssUrl: 'https://feed.podbean.com/vinohradska12/feed.xml',
    spotifyShowUrl: 'https://open.spotify.com/show/5cJ0lQOiVLvdleoqopdRBL',
    appleUrl: 'https://podcasts.apple.com/cz/podcast/vinohradsk%C3%A1-12/id1460167711',
    webUrl: 'https://www.mujrozhlas.cz/vinohradska-12',
    defaultImage: '/podcast-news.svg',
    priority: 1,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'petarda',
    name: 'Petarda Podcast',
    category: 'Lifestyle',
    categoryColor: '#ffd93d',
    rssUrl: 'https://anchor.fm/s/889fd2c8/podcast/rss',
    spotifyShowUrl: 'https://open.spotify.com/show/4AqLOvEa7xgmPmcTLqVGgN',
    defaultImage: '/podcast-lifestyle.svg',
    priority: 2,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'newsroom',
    name: 'Newsroom ČT24',
    category: 'Zprávy',
    categoryColor: '#74c0fc',
    rssUrl: 'https://feed.podbean.com/newsroomct24/feed.xml',
    spotifyShowUrl: 'https://open.spotify.com/show/0iMCXoZfqZJILT1VpSy7zG',
    webUrl: 'https://ct24.ceskatelevize.cz/tema/newsroom-1067824',
    defaultImage: '/podcast-news.svg',
    priority: 3,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'g2',
    name: 'G2 Podcast',
    category: 'Gaming',
    categoryColor: '#a78bfa',
    rssUrl: 'https://anchor.fm/s/100be588/podcast/rss',
    spotifyShowUrl: 'https://open.spotify.com/show/39fLlIdLPn5I2CKKF5CdVu',
    defaultImage: '/podcast-tech.svg',
    priority: 4,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'startupjobs',
    name: 'StartupJobs Podcast',
    category: 'Byznys',
    categoryColor: '#4ecdc4',
    rssUrl: 'https://anchor.fm/s/3dbe2a8/podcast/rss',
    spotifyShowUrl: 'https://open.spotify.com/show/4EX1YjJLqmgaPmJrCDQ3qj',
    defaultImage: '/podcast-business.svg',
    priority: 5,
    region: 'czech',
    language: 'cs',
  },
  {
    id: 'newtonmedia',
    name: 'Newton Media Podcast',
    category: 'Média',
    categoryColor: '#ff85a1',
    rssUrl: 'https://anchor.fm/s/57d9a434/podcast/rss',
    spotifyShowUrl: 'https://open.spotify.com/show/4uvnOY8gL8TM7kPEHqFlVh',
    defaultImage: '/podcast-media.svg',
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
