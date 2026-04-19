import { WorldNews } from '@/types';

interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  'media:content'?: { $: { url: string } };
  enclosure?: { url: string };
}

// Quality RSS feeds from reliable sources (no API key needed)
const NEWS_SOURCES = [
  {
    id: 'bbc-world',
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'world' as const,
  },
  {
    id: 'guardian-world',
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    category: 'world' as const,
  },
  {
    id: 'npr-world',
    name: 'NPR World',
    url: 'https://feeds.npr.org/1004/rss.xml',
    category: 'world' as const,
  },
  {
    id: 'bbc-europe',
    name: 'BBC Europe',
    url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml',
    category: 'europe' as const,
  },
  {
    id: 'bbc-business',
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'business' as const,
  },
];

async function fetchRSSFeed(source: typeof NEWS_SOURCES[0]): Promise<WorldNews[]> {
  try {
    // Use a simple fetch with RSS parsing
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'DecisionUp/1.0',
      },
      signal: AbortSignal.timeout(5000), // Reduced timeout
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`);
      return [];
    }

    const text = await response.text();
    
    // Simple RSS parsing (extract items)
    const items: WorldNews[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(text)) !== null && items.length < 3) {
      const itemXml = match[1];
      
      const title = extractTag(itemXml, 'title');
      const link = extractTag(itemXml, 'link') || extractTag(itemXml, 'guid');
      const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'content:encoded');
      const pubDate = extractTag(itemXml, 'pubDate');
      
      if (title && link) {
        items.push({
          id: `${source.id}-${items.length}`,
          title: cleanHtml(title),
          description: cleanHtml(description || '').slice(0, 200),
          url: link,
          source: source.name,
          category: source.category,
          publishedAt: pubDate || new Date().toISOString(),
        });
      }
    }
    
    return items;
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  
  // Handle regular tags
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export async function fetchAllNews(): Promise<WorldNews[]> {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(source => fetchRSSFeed(source))
  );
  
  const allNews: WorldNews[] = [];
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  });
  
  // Sort by date (newest first) and remove duplicates
  const sorted = allNews.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // Enhanced deduplication - check both URL and title similarity
  const unique: WorldNews[] = [];
  const seenUrls = new Set<string>();
  const seenTitleWords = new Map<string, number>(); // Track title word frequency
  
  for (const item of sorted) {
    // Skip if we've seen this exact URL
    const normalizedUrl = normalizeUrl(item.url);
    if (seenUrls.has(normalizedUrl)) {
      continue;
    }
    
    // Check title similarity against existing items
    const normalizedTitle = item.title.toLowerCase().trim();
    const isDuplicateTitle = unique.some(existing => {
      const existingTitle = existing.title.toLowerCase().trim();
      // Check exact match first
      if (normalizedTitle === existingTitle) return true;
      // Check similarity score
      return similarity(existingTitle, normalizedTitle) > 0.6;
    });
    
    if (!isDuplicateTitle) {
      unique.push(item);
      seenUrls.add(normalizedUrl);
    }
  }
  
  return unique.slice(0, 15); // Return top 15 news items
}

// Normalize URL for comparison (remove query params, trailing slashes, etc.)
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    parsed.searchParams.delete('ref');
    // Return path without trailing slash
    return `${parsed.hostname}${parsed.pathname.replace(/\/$/, '')}`;
  } catch {
    return url.toLowerCase();
  }
}

// Simple string similarity (Jaccard index on words)
function similarity(a: string, b: string): number {
  // Remove common stop words for better comparison
  const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'was', 'were', 'as', 'by', 'with']);
  
  const wordsA = new Set(a.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)));
  const wordsB = new Set(b.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)));
  
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}
