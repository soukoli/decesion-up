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

// Reliable Czech news sources with high credibility
const CZECH_NEWS_SOURCES = [
  {
    id: 'ct24',
    name: 'ČT24',
    url: 'https://ct24.ceskatelevize.cz/rss/hlavni-zpravy',
    category: 'domaci' as const,
    credibility: 95,
    type: 'public'
  },
  {
    id: 'irozhlas',
    name: 'iROZHLAS',
    url: 'https://www.irozhlas.cz/rss',
    category: 'domaci' as const,
    credibility: 95,
    type: 'public'
  },
  {
    id: 'aktualne',
    name: 'Aktuálně.cz',
    url: 'https://www.aktualne.cz/rss/',
    category: 'domaci' as const,
    credibility: 80,
    type: 'independent'
  },
  {
    id: 'ct24-ekonomika',
    name: 'ČT24 Ekonomika',
    url: 'https://ct24.ceskatelevize.cz/rss/ekonomika',
    category: 'ekonomika' as const,
    credibility: 95,
    type: 'public'
  },
  {
    id: 'irozhlas-ekonomika',
    name: 'iROZHLAS Ekonomika',
    url: 'https://www.irozhlas.cz/ekonomika/rss',
    category: 'ekonomika' as const,
    credibility: 95,
    type: 'public'
  }
];

async function fetchCzechRSSFeed(source: typeof CZECH_NEWS_SOURCES[0]): Promise<WorldNews[]> {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'DecisionUp/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(7000), // Longer timeout for Czech sources
      next: { revalidate: 1200 }, // Cache for 20 minutes (more frequent updates)
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`);
      return [];
    }

    const text = await response.text();
    
    // Enhanced RSS parsing for Czech sources
    const items: WorldNews[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(text)) !== null && items.length < 4) {
      const itemXml = match[1];
      
      const title = extractTag(itemXml, 'title');
      const link = extractTag(itemXml, 'link') || extractTag(itemXml, 'guid');
      const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'content:encoded');
      const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date');
      
      if (title && link) {
        // Calculate freshness for Czech news
        const publishDate = new Date(pubDate || new Date());
        const hoursAgo = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60);
        
        items.push({
          id: `${source.id}-${Date.now()}-${items.length}`,
          title: cleanHtml(title),
          description: cleanHtml(description || '').slice(0, 180),
          url: link,
          source: source.name,
          category: source.category,
          publishedAt: publishDate.toISOString(),
          // Add Czech-specific metadata
          credibility: source.credibility,
          freshness: hoursAgo < 1 ? 'hot' : hoursAgo < 6 ? 'fresh' : hoursAgo < 24 ? 'recent' : 'old',
          sourceType: source.type as 'public' | 'private' | 'independent',
          isLocal: true, // Mark as Czech/local news
        });
      }
    }
    
    return items;
  } catch (error) {
    console.error(`Error fetching Czech news from ${source.name}:`, error);
    return [];
  }
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  
  // Handle regular tags with attributes
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
    .replace(/&hellip;/g, '...')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .trim();
}

export async function fetchAllCzechNews(): Promise<WorldNews[]> {
  const results = await Promise.allSettled(
    CZECH_NEWS_SOURCES.map(source => fetchCzechRSSFeed(source))
  );
  
  const allNews: WorldNews[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    } else {
      console.error(`Failed to fetch from ${CZECH_NEWS_SOURCES[index].name}:`, result.reason);
    }
  });
  
  // Advanced sorting: freshness first, then date, then credibility
  const sorted = allNews.sort((a, b) => {
    // First sort by freshness
    const freshnessOrder = { hot: 0, fresh: 1, recent: 2, old: 3 };
    const freshnessA = freshnessOrder[a.freshness as keyof typeof freshnessOrder] ?? 4;
    const freshnessB = freshnessOrder[b.freshness as keyof typeof freshnessOrder] ?? 4;
    
    if (freshnessA !== freshnessB) {
      return freshnessA - freshnessB;
    }
    
    // Then by publication date (newest first)
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    
    if (Math.abs(dateA - dateB) > 3600000) { // If more than 1 hour difference
      return dateB - dateA;
    }
    
    // Finally by credibility (higher first)
    return (b.credibility || 0) - (a.credibility || 0);
  });
  
  // Enhanced deduplication for Czech content
  const unique: WorldNews[] = [];
  const seenUrls = new Set<string>();
  const seenTitleHashes = new Set<string>();
  
  for (const item of sorted) {
    // Normalize URL for comparison
    const normalizedUrl = normalizeUrl(item.url);
    if (seenUrls.has(normalizedUrl)) {
      continue;
    }
    
    // Create title hash for duplicate detection
    const titleHash = createTitleHash(item.title);
    if (seenTitleHashes.has(titleHash)) {
      continue;
    }
    
    // Check for similar titles
    const isDuplicate = unique.some(existing => {
      const similarity = calculateSimilarity(
        item.title.toLowerCase().trim(),
        existing.title.toLowerCase().trim()
      );
      return similarity > 0.7; // Higher threshold for Czech content
    });
    
    if (!isDuplicate) {
      unique.push(item);
      seenUrls.add(normalizedUrl);
      seenTitleHashes.add(titleHash);
    }
  }
  
  return unique.slice(0, 12); // Return top 12 Czech news items
}

// Create simple hash for title comparison
function createTitleHash(title: string): string {
  const normalized = title.toLowerCase()
    .replace(/[^a-záčďéěíňóřšťůúýž\s]/g, '') // Keep Czech characters and spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = normalized.split(' ')
    .filter(word => word.length > 3) // Filter out short words
    .slice(0, 5); // Take first 5 significant words
  
  return words.join('|');
}

// Normalize URL for comparison
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove tracking parameters common in Czech media
    const paramsToRemove = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
      'fbclid', 'gclid', 'ref', 'source', 'campaign'
    ];
    
    paramsToRemove.forEach(param => {
      parsed.searchParams.delete(param);
    });
    
    return `${parsed.hostname}${parsed.pathname.replace(/\/$/, '')}`;
  } catch {
    return url.toLowerCase();
  }
}

// Enhanced similarity calculation for Czech text
function calculateSimilarity(a: string, b: string): number {
  // Czech stop words to ignore in similarity calculation
  const czechStopWords = new Set([
    'a', 'aby', 'ale', 'am', 'ano', 'asi', 'až', 'bez', 'bude', 'byl', 'byla', 'bylo', 'být',
    'co', 'či', 'do', 'ho', 'ich', 'jak', 'jako', 'je', 'jeho', 'její', 'jen', 'již', 'jsem',
    'jsi', 'jsme', 'jsou', 'jste', 'kam', 'kde', 'kdo', 'kdy', 'ke', 'která', 'které', 'který',
    'má', 'mají', 'můj', 'na', 'nad', 'nás', 'naše', 'ně', 'nej', 'není', 'něj', 'nová',
    'nové', 'nový', 'po', 'pod', 'pro', 'se', 'si', 'své', 'ta', 'tak', 'také', 'té', 'tem',
    'této', 'to', 'tu', 'už', 'vám', 've', 'více', 'za', 'ze'
  ]);
  
  const wordsA = new Set(
    a.split(/\s+/)
      .filter(w => w.length > 2 && !czechStopWords.has(w.toLowerCase()))
      .map(w => w.toLowerCase())
  );
  
  const wordsB = new Set(
    b.split(/\s+/)
      .filter(w => w.length > 2 && !czechStopWords.has(w.toLowerCase()))
      .map(w => w.toLowerCase())
  );
  
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  
  return intersection.size / union.size;
}

export { CZECH_NEWS_SOURCES };