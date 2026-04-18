import Parser from 'rss-parser';
import { PODCASTS, PodcastConfig, GLOBAL_PODCASTS, CZECH_PODCASTS } from './podcasts-config';
import { PodcastEpisode } from '@/types';

const parser = new Parser({
  timeout: 8000, // 8 second timeout
  customFields: {
    item: [
      ['itunes:duration', 'duration'],
      ['itunes:image', 'itunesImage'],
    ],
  },
});

function formatDuration(duration: string | undefined): string {
  if (!duration) return '~20 min';
  
  // Handle HH:MM:SS format
  if (duration.includes(':')) {
    const parts = duration.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes} min`;
    }
    if (parts.length === 2) {
      return `${parseInt(parts[0])} min`;
    }
  }
  
  // Handle seconds format
  const seconds = parseInt(duration);
  if (!isNaN(seconds)) {
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes} min`;
  }
  
  return duration;
}

export async function fetchPodcastEpisode(config: PodcastConfig): Promise<PodcastEpisode | null> {
  try {
    const feed = await parser.parseURL(config.rssUrl);
    
    if (!feed.items || feed.items.length === 0) {
      // Return fallback if no items
      return createFallbackEpisode(config);
    }
    
    // Get the most recent episode
    const item = feed.items[0];
    
    // Extract image URL
    let imageUrl = '';
    if (item.itunesImage?.href) {
      imageUrl = item.itunesImage.href;
    } else if (item.itunesImage && typeof item.itunesImage === 'string') {
      imageUrl = item.itunesImage;
    } else if (feed.image?.url) {
      imageUrl = feed.image.url;
    } else if (feed.itunes?.image) {
      imageUrl = feed.itunes.image;
    }
    
    return {
      id: `${config.id}-${item.guid || item.link || Date.now()}`,
      podcastName: config.name,
      title: item.title || 'Latest Episode',
      description: item.contentSnippet || item.content || '',
      duration: formatDuration(item.duration),
      pubDate: item.pubDate || new Date().toISOString(),
      imageUrl,
      spotifyUrl: config.spotifyShowUrl,
      appleUrl: config.appleUrl,
      webUrl: config.webUrl,
      category: config.category,
      categoryColor: config.categoryColor,
      region: config.region,
      language: config.language,
    };
  } catch (error) {
    console.error(`Error fetching podcast ${config.name}:`, error);
    // Return fallback data instead of null
    return createFallbackEpisode(config);
  }
}

function createFallbackEpisode(config: PodcastConfig): PodcastEpisode {
  return {
    id: `${config.id}-fallback`,
    podcastName: config.name,
    title: 'Latest Episode',
    description: `Listen to the latest episode of ${config.name}`,
    duration: '~30 min',
    pubDate: new Date().toISOString(),
    imageUrl: '',
    spotifyUrl: config.spotifyShowUrl,
    appleUrl: config.appleUrl,
    webUrl: config.webUrl,
    category: config.category,
    categoryColor: config.categoryColor,
    region: config.region,
    language: config.language,
  };
}

export async function fetchAllPodcasts(): Promise<PodcastEpisode[]> {
  const results = await Promise.allSettled(
    PODCASTS.map(config => fetchPodcastEpisode(config))
  );
  
  const episodes: PodcastEpisode[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      episodes.push(result.value);
    } else {
      console.warn(`Failed to fetch podcast: ${PODCASTS[index].name}`);
    }
  });
  
  return episodes;
}

export async function fetchGlobalPodcasts(): Promise<PodcastEpisode[]> {
  const results = await Promise.allSettled(
    GLOBAL_PODCASTS.map(config => fetchPodcastEpisode(config))
  );
  
  const episodes: PodcastEpisode[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      episodes.push(result.value);
    } else {
      console.warn(`Failed to fetch global podcast: ${GLOBAL_PODCASTS[index].name}`);
    }
  });
  
  return episodes;
}

export async function fetchCzechPodcasts(): Promise<PodcastEpisode[]> {
  const results = await Promise.allSettled(
    CZECH_PODCASTS.map(config => fetchPodcastEpisode(config))
  );
  
  const episodes: PodcastEpisode[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      episodes.push(result.value);
    } else {
      console.warn(`Failed to fetch Czech podcast: ${CZECH_PODCASTS[index].name}`);
    }
  });
  
  return episodes;
}
