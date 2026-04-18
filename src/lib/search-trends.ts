// Google Trends RSS Feed - Official, FREE, unlimited
// Shows what people are ACTUALLY searching for on Google

export interface SearchTrend {
  id: string;
  rank: number;
  title: string;
  traffic: string; // e.g. "500K+", "1M+"
  trafficNumber: number; // for sorting
  url: string;
  newsItems: {
    title: string;
    url: string;
    source: string;
  }[];
  relatedQueries: string[];
  imageUrl?: string;
  pubDate: string;
  source: 'google-us' | 'google-cz';
  region: 'global' | 'czech';
}

export interface TrendsData {
  global: SearchTrend[];
  czech: SearchTrend[];
  period: string;
  periodLabel: string;
  lastUpdated: string;
}

function parseTraffic(traffic: string): number {
  if (!traffic) return 0;
  const clean = traffic.replace(/[+,]/g, '').trim();
  
  if (clean.includes('M')) {
    return parseFloat(clean.replace('M', '')) * 1000000;
  }
  if (clean.includes('K')) {
    return parseFloat(clean.replace('K', '')) * 1000;
  }
  return parseInt(clean) || 0;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  
  // Handle CDATA
  const content = match[1];
  const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return cdataMatch ? cdataMatch[1].trim() : content.trim();
}

async function fetchGoogleTrends(geo: string = 'US', region: 'global' | 'czech' = 'global'): Promise<SearchTrend[]> {
  try {
    // Google Trends RSS Feed - official endpoint
    const url = `https://trends.google.com/trending/rss?geo=${geo}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DecisionUp/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.error(`Google Trends API error for ${geo}: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    const trends: SearchTrend[] = [];
    
    // Parse RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;
    let rank = 0;
    const sourceId = geo === 'CZ' ? 'google-cz' : 'google-us';
    
    while ((itemMatch = itemRegex.exec(xml)) !== null && rank < 10) {
      const itemXml = itemMatch[1];
      rank++;
      
      const title = extractTag(itemXml, 'title');
      const traffic = extractTag(itemXml, 'ht:approx_traffic') || extractTag(itemXml, 'ht\\:approx_traffic');
      const link = extractTag(itemXml, 'link') || `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=${geo}`;
      const pubDate = extractTag(itemXml, 'pubDate');
      const picture = extractTag(itemXml, 'ht:picture') || extractTag(itemXml, 'ht\\:picture');
      
      // Parse news items
      const newsItems: SearchTrend['newsItems'] = [];
      const newsItemRegex = /<ht:news_item>([\s\S]*?)<\/ht:news_item>/g;
      let newsMatch;
      
      while ((newsMatch = newsItemRegex.exec(itemXml)) !== null && newsItems.length < 3) {
        const newsXml = newsMatch[1];
        const newsTitle = extractTag(newsXml, 'ht:news_item_title') || extractTag(newsXml, 'ht\\:news_item_title');
        const newsUrl = extractTag(newsXml, 'ht:news_item_url') || extractTag(newsXml, 'ht\\:news_item_url');
        const newsSource = extractTag(newsXml, 'ht:news_item_source') || extractTag(newsXml, 'ht\\:news_item_source');
        
        if (newsTitle) {
          newsItems.push({
            title: newsTitle,
            url: newsUrl,
            source: newsSource,
          });
        }
      }
      
      if (title) {
        trends.push({
          id: `${sourceId}-${rank}`,
          rank,
          title,
          traffic: traffic || '10K+',
          trafficNumber: parseTraffic(traffic),
          url: link,
          newsItems,
          relatedQueries: [],
          imageUrl: picture || undefined,
          pubDate: pubDate || new Date().toISOString(),
          source: sourceId,
          region,
        });
      }
    }
    
    // Sort by traffic and limit to 10
    return trends
      .sort((a, b) => b.trafficNumber - a.trafficNumber)
      .slice(0, 10)
      .map((t, i) => ({ ...t, rank: i + 1 }));
  } catch (error) {
    console.error(`Error fetching Google Trends for ${geo}:`, error);
    return [];
  }
}

export async function fetchSearchTrends(): Promise<TrendsData> {
  // Fetch trends from Google for both US (global) and Czech Republic
  const [globalTrends, czechTrends] = await Promise.all([
    fetchGoogleTrends('US', 'global'),
    fetchGoogleTrends('CZ', 'czech'),
  ]);
  
  return {
    global: globalTrends,
    czech: czechTrends,
    period: '1d',
    periodLabel: 'Today',
    lastUpdated: new Date().toISOString(),
  };
}

// Legacy export for backward compatibility
export async function fetchSearchTrendsLegacy(): Promise<SearchTrend[]> {
  const data = await fetchSearchTrends();
  return data.global;
}
