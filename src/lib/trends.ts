import { TechTrend } from '@/types';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants: number;
  time: number;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days}d ago`;
}

export async function fetchHackerNewsTrends(): Promise<TechTrend[]> {
  try {
    // Get top stories IDs
    const topStoriesRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json'
    );
    const topStoryIds: number[] = await topStoriesRes.json();
    
    // Fetch top 10 stories
    const storyPromises = topStoryIds.slice(0, 10).map(async (id) => {
      const res = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return res.json() as Promise<HNItem>;
    });
    
    const stories = await Promise.all(storyPromises);
    
    return stories
      .filter(story => story && story.title)
      .map(story => ({
        id: `hn-${story.id}`,
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        score: story.score,
        comments: story.descendants || 0,
        source: 'hackernews' as const,
        timeAgo: timeAgo(story.time),
      }));
  } catch (error) {
    console.error('Error fetching Hacker News:', error);
    return [];
  }
}

export async function fetchAllTrends(): Promise<TechTrend[]> {
  const hnTrends = await fetchHackerNewsTrends();
  return hnTrends;
}
