// Wikipedia Pageviews API - shows what people are searching/reading NOW
// Completely free, no auth, unlimited requests

export interface TrendingTopic {
  id: string;
  title: string;
  views: number;
  rank: number;
  url: string;
  category?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function getYesterdayDate(): { year: string; month: string; day: string } {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Wikipedia data is usually 1 day behind
  
  return {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    day: date.getDate().toString().padStart(2, '0'),
  };
}

// Filter out boring/common pages
const EXCLUDED_PAGES = [
  'Main_Page',
  'Special:',
  'Wikipedia:',
  'File:',
  'Portal:',
  'Help:',
  'Template:',
  'Category:',
  '-',
  'Pornhub', // explicit content
  'XXX',
  'Deaths_in_',
  'List_of_',
];

function shouldInclude(title: string): boolean {
  return !EXCLUDED_PAGES.some(excluded => 
    title.includes(excluded) || title.startsWith(excluded)
  );
}

function categorizeArticle(title: string): string | undefined {
  const lowerTitle = title.toLowerCase().replace(/_/g, ' ');
  
  // People
  if (lowerTitle.includes('(actor)') || lowerTitle.includes('(actress)') ||
      lowerTitle.includes('(singer)') || lowerTitle.includes('(musician)')) {
    return 'Entertainment';
  }
  if (lowerTitle.includes('(politician)') || lowerTitle.includes('president') ||
      lowerTitle.includes('minister')) {
    return 'Politics';
  }
  if (lowerTitle.includes('(footballer)') || lowerTitle.includes('(basketball)') ||
      lowerTitle.includes('(athlete)') || lowerTitle.includes('championship') ||
      lowerTitle.includes('world cup') || lowerTitle.includes('olympics')) {
    return 'Sports';
  }
  
  // Events
  if (lowerTitle.includes('war') || lowerTitle.includes('conflict') ||
      lowerTitle.includes('attack') || lowerTitle.includes('shooting')) {
    return 'Conflict';
  }
  if (lowerTitle.includes('earthquake') || lowerTitle.includes('hurricane') ||
      lowerTitle.includes('flood') || lowerTitle.includes('fire')) {
    return 'Disaster';
  }
  if (lowerTitle.includes('election') || lowerTitle.includes('vote')) {
    return 'Politics';
  }
  
  // Tech
  if (lowerTitle.includes('ai') || lowerTitle.includes('artificial intelligence') ||
      lowerTitle.includes('chatgpt') || lowerTitle.includes('openai') ||
      lowerTitle.includes('google') || lowerTitle.includes('apple') ||
      lowerTitle.includes('microsoft') || lowerTitle.includes('tesla')) {
    return 'Technology';
  }
  
  return undefined;
}

export async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const { year, month, day } = getYesterdayDate();
    
    // Wikipedia REST API for top pageviews
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DecisionUp/1.0 (https://decisionup.vercel.app; contact@example.com)',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.error(`Wikipedia API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const articles = data.items?.[0]?.articles || [];
    
    const topics: TrendingTopic[] = [];
    let rank = 1;
    
    for (const article of articles) {
      if (topics.length >= 20) break;
      
      const title = article.article;
      
      if (!shouldInclude(title)) continue;
      
      topics.push({
        id: `wiki-${rank}`,
        title: title.replace(/_/g, ' '),
        views: article.views,
        rank,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        category: categorizeArticle(title),
      });
      
      rank++;
    }
    
    return topics;
  } catch (error) {
    console.error('Error fetching Wikipedia trending:', error);
    return [];
  }
}

// Format views for display
export function formatViews(views: number): string {
  return formatNumber(views) + ' views';
}
