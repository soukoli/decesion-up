// Google Trends RSS Feed - Official, FREE, unlimited
// Shows what people are ACTUALLY searching for on Google

export interface SearchTrend {
  id: string;
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
}

interface GoogleTrendsItem {
  title: string;
  'ht:approx_traffic'?: string;
  link?: string;
  pubDate?: string;
  'ht:news_item'?: Array<{
    'ht:news_item_title'?: string;
    'ht:news_item_url'?: string;
    'ht:news_item_source'?: string;
  }>;
  'ht:picture'?: string;
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

function extractAllTags(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  const matches = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const content = match[1];
    const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    matches.push(cdataMatch ? cdataMatch[1].trim() : content.trim());
  }
  return matches;
}

async function fetchGoogleTrends(geo: string = 'US'): Promise<SearchTrend[]> {
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
      console.error(`Google Trends API error: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    const trends: SearchTrend[] = [];
    
    // Parse RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;
    let rank = 0;
    
    while ((itemMatch = itemRegex.exec(xml)) !== null && rank < 20) {
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
          id: `gtrend-${rank}`,
          title,
          traffic: traffic || '10K+',
          trafficNumber: parseTraffic(traffic),
          url: link,
          newsItems,
          relatedQueries: [],
          imageUrl: picture || undefined,
          pubDate: pubDate || new Date().toISOString(),
        });
      }
    }
    
    // Sort by traffic
    trends.sort((a, b) => b.trafficNumber - a.trafficNumber);
    
    return trends;
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    return [];
  }
}

export async function fetchSearchTrends(): Promise<SearchTrend[]> {
  // Fetch trends from multiple regions and combine
  const [usTrends, globalTrends] = await Promise.all([
    fetchGoogleTrends('US'),
    fetchGoogleTrends('GB'), // UK for more global perspective
  ]);
  
  // Combine and deduplicate
  const seen = new Set<string>();
  const combined: SearchTrend[] = [];
  
  for (const trend of [...usTrends, ...globalTrends]) {
    const normalizedTitle = trend.title.toLowerCase();
    if (!seen.has(normalizedTitle)) {
      seen.add(normalizedTitle);
      combined.push(trend);
    }
  }
  
  // Sort by traffic and return top 15
  return combined
    .sort((a, b) => b.trafficNumber - a.trafficNumber)
    .slice(0, 15);
}
