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
  
  // Sort by date (newest first) and remove duplicates by title similarity
  const sorted = allNews.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // Simple deduplication - remove very similar titles
  const unique: WorldNews[] = [];
  for (const item of sorted) {
    const isDuplicate = unique.some(existing => 
      similarity(existing.title.toLowerCase(), item.title.toLowerCase()) > 0.7
    );
    if (!isDuplicate) {
      unique.push(item);
    }
  }
  
  return unique.slice(0, 15); // Return top 15 news items
}

// Simple string similarity (Jaccard index on words)
function similarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}
