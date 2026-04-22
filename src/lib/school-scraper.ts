import * as cheerio from 'cheerio';
import { SchoolArticle } from '@/types';

const BASE_URL = 'https://www.horackova.cz';
const NOVINKY_URL = `${BASE_URL}/o-skole`;
const DRUZINA_URL = `${BASE_URL}/druzina`;

// Category colors
export const SCHOOL_CATEGORY_COLORS = {
  Novinky: '#60a5fa',  // blue-400
  Družina: '#f97316',  // orange-500
};

// Parse Czech date format: "úterý, 21 duben 2026 13:45"
function parseCzechDate(dateStr: string): string {
  const months: Record<string, string> = {
    'leden': '01', 'únor': '02', 'březen': '03', 'duben': '04',
    'květen': '05', 'červen': '06', 'červenec': '07', 'srpen': '08',
    'září': '09', 'říjen': '10', 'listopad': '11', 'prosinec': '12',
  };
  
  try {
    // Extract: "21 duben 2026 13:45"
    const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{2}):(\d{2})/);
    if (match) {
      const [, day, monthName, year, hour, minute] = match;
      const month = months[monthName.toLowerCase()] || '01';
      return `${year}-${month}-${day.padStart(2, '0')}T${hour}:${minute}:00`;
    }
  } catch {
    // fallback
  }
  return new Date().toISOString();
}

// Scrape articles from a page
async function scrapeArticles(
  url: string, 
  category: 'Novinky' | 'Družina'
): Promise<SchoolArticle[]> {
  const articles: SchoolArticle[] = [];
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DecisionUp/1.0)',
        'Accept': 'text/html',
      },
      next: { revalidate: 1800 }, // 30 min cache
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return articles;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Different selectors for each page
    if (category === 'Novinky') {
      // /o-skole page structure
      $('div.catItemView, div[class*="itemView"]').each((i, el) => {
        const $el = $(el);
        
        // Get title and link
        const $titleLink = $el.find('h3 a, .catItemTitle a, .itemTitle a').first();
        const title = $titleLink.text().trim() || $el.find('h3').first().text().trim();
        let articlePath = $titleLink.attr('href') || '';
        
        // Skip if no title
        if (!title || title === 'Doporučený') return;
        
        // Get date
        const dateText = $el.text();
        const dateMatch = dateText.match(/\w+,\s*\d{1,2}\s+\w+\s+\d{4}\s+\d{2}:\d{2}/);
        const pubDate = dateMatch ? parseCzechDate(dateMatch[0]) : new Date().toISOString();
        
        // Get image
        let imageUrl: string | null = null;
        const $img = $el.find('img').first();
        if ($img.length) {
          const src = $img.attr('src');
          if (src && !src.includes('icon') && !src.includes('button')) {
            imageUrl = src.startsWith('http') ? src : `${BASE_URL}${src}`;
          }
        }
        
        // Get description
        const description = $el.find('.catItemIntroText, .itemIntroText, p').first().text().trim().slice(0, 200);
        
        // Build full URL
        const articleUrl = articlePath.startsWith('http') 
          ? articlePath 
          : `${BASE_URL}${articlePath}`;
        
        if (title && articlePath) {
          articles.push({
            id: `novinky-${i}-${Date.now()}`,
            title: title.replace('Doporučený', '').trim(),
            description,
            pubDate,
            imageUrl,
            articleUrl,
            category: 'Novinky',
            categoryColor: SCHOOL_CATEGORY_COLORS.Novinky,
          });
        }
      });
    } else {
      // /druzina page structure - different layout
      $('div.catItemView, div[class*="itemContainer"], .itemList > div').each((i, el) => {
        const $el = $(el);
        
        const $titleLink = $el.find('h3 a, .catItemTitle a, a[href*="/druzina/item/"]').first();
        const title = $titleLink.text().trim();
        let articlePath = $titleLink.attr('href') || '';
        
        if (!title) return;
        
        // Get date from text content
        const dateText = $el.text();
        const dateMatch = dateText.match(/\w+,\s*\d{1,2}\s+\w+\s+\d{4}\s+\d{2}:\d{2}/);
        const pubDate = dateMatch ? parseCzechDate(dateMatch[0]) : new Date().toISOString();
        
        // Get image
        let imageUrl: string | null = null;
        const $img = $el.find('img').first();
        if ($img.length) {
          const src = $img.attr('src');
          if (src && !src.includes('icon') && !src.includes('button')) {
            imageUrl = src.startsWith('http') ? src : `${BASE_URL}${src}`;
          }
        }
        
        const description = $el.find('.catItemIntroText, p').first().text().trim().slice(0, 200);
        
        const articleUrl = articlePath.startsWith('http') 
          ? articlePath 
          : `${BASE_URL}${articlePath}`;
        
        if (title && articlePath) {
          articles.push({
            id: `druzina-${i}-${Date.now()}`,
            title,
            description,
            pubDate,
            imageUrl,
            articleUrl,
            category: 'Družina',
            categoryColor: SCHOOL_CATEGORY_COLORS.Družina,
          });
        }
      });
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }
  
  return articles;
}

// Alternative simpler scraper using link patterns
async function scrapeArticlesSimple(
  url: string, 
  category: 'Novinky' | 'Družina'
): Promise<SchoolArticle[]> {
  const articles: SchoolArticle[] = [];
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DecisionUp/1.0)',
      },
    });
    
    if (!response.ok) return articles;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find all article links
    const itemPattern = category === 'Novinky' ? '/o-skole/item/' : '/druzina/item/';
    const seenUrls = new Set<string>();
    
    $(`a[href*="${itemPattern}"]`).each((i, el) => {
      const $link = $(el);
      const href = $link.attr('href');
      if (!href || seenUrls.has(href)) return;
      
      const title = $link.text().trim();
      if (!title || title.length < 3 || title === 'detail článku') return;
      
      seenUrls.add(href);
      
      // Try to find parent container for more info
      const $container = $link.closest('div[class*="item"], div[class*="cat"]');
      
      // Get date from container or nearby text
      let pubDate = new Date().toISOString();
      const containerText = $container.text() || '';
      const dateMatch = containerText.match(/\w+,\s*\d{1,2}\s+\w+\s+\d{4}\s+\d{2}:\d{2}/);
      if (dateMatch) {
        pubDate = parseCzechDate(dateMatch[0]);
      }
      
      // Get image
      let imageUrl: string | null = null;
      const $img = $container.find('img').first();
      if ($img.length) {
        const src = $img.attr('src');
        if (src && src.includes('/media/') && !src.includes('icon')) {
          imageUrl = src.startsWith('http') ? src : `${BASE_URL}${src}`;
        }
      }
      
      // Get description
      let description = '';
      const $intro = $container.find('.catItemIntroText, .itemIntroText, p').first();
      if ($intro.length) {
        description = $intro.text().trim().slice(0, 200);
      }
      
      const articleUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      
      articles.push({
        id: `${category.toLowerCase()}-${i}-${href.split('/').pop()}`,
        title,
        description,
        pubDate,
        imageUrl,
        articleUrl,
        category,
        categoryColor: SCHOOL_CATEGORY_COLORS[category],
      });
    });
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }
  
  // Limit and dedupe
  return articles.slice(0, 15);
}

// Main function to fetch all school articles
export async function fetchSchoolArticles(): Promise<SchoolArticle[]> {
  try {
    const [novinky, druzina] = await Promise.all([
      scrapeArticlesSimple(NOVINKY_URL, 'Novinky'),
      scrapeArticlesSimple(DRUZINA_URL, 'Družina'),
    ]);
    
    // Combine and sort by date (newest first)
    const allArticles = [...novinky, ...druzina];
    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    return allArticles;
  } catch (error) {
    console.error('Error fetching school articles:', error);
    return [];
  }
}

// Get categories helper
export const getSchoolCategories = () => ['Vše', 'Novinky', 'Družina'] as const;
