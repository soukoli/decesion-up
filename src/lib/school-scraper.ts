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

// Parse Czech date format: "úterý, 21 duben 2026 13:45" or "20.01.2026"
function parseCzechDate(dateStr: string): string {
  const months: Record<string, string> = {
    'leden': '01', 'únor': '02', 'březen': '03', 'duben': '04',
    'květen': '05', 'červen': '06', 'červenec': '07', 'srpen': '08',
    'září': '09', 'říjen': '10', 'listopad': '11', 'prosinec': '12',
  };
  
  try {
    // Try format: "DD.MM.YYYY" 
    const dotMatch = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (dotMatch) {
      const [, day, month, year] = dotMatch;
      return `${year}-${month}-${day}T00:00:00`;
    }
    
    // Try format: "dayname, DD monthname YYYY HH:MM"
    // Use [^\s,]+ instead of \w+ for Czech chars
    const match = dateStr.match(/(\d{1,2})\s+([^\s,]+)\s+(\d{4})\s+(\d{2}):(\d{2})/);
    if (match) {
      const [, day, monthName, year, hour, minute] = match;
      const month = months[monthName.toLowerCase()];
      if (month) {
        return `${year}-${month}-${day.padStart(2, '0')}T${hour}:${minute}:00`;
      }
    }
  } catch (e) {
    console.error('Date parse error:', e);
  }
  return new Date().toISOString();
}

// Scrape articles using K2 CMS structure
async function scrapeArticlesK2(
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
    
    // K2 uses catItemView for each article card
    $('.catItemView').each((i, el) => {
      const $el = $(el);
      
      // Get title and link from h3.catItemTitle a
      const $titleLink = $el.find('.catItemTitle a, h3 a').first();
      let title = $titleLink.text().trim();
      const href = $titleLink.attr('href');
      
      // Skip featured flag text
      title = title.replace(/Doporučený/g, '').trim();
      
      if (!title || !href || title.length < 3) return;
      
      // Get date from .catItemDateCreated - format: "čtvrtek, 09 duben 2026 22:00"
      const dateText = $el.find('.catItemDateCreated').text().trim();
      const pubDate = parseCzechDate(dateText);
      
      // Get image from .catItemImageBlock img
      let imageUrl: string | null = null;
      const $img = $el.find('.catItemImageBlock img, .catItemImage img').first();
      if ($img.length) {
        let src = $img.attr('src');
        if (src) {
          // Replace _S.jpg with _M.jpg for medium size
          src = src.replace(/_S\.jpg$/, '_M.jpg');
          imageUrl = src.startsWith('http') ? src : `${BASE_URL}${src}`;
        }
      }
      
      // Get description from .catItemIntroText
      let description = '';
      const $intro = $el.find('.catItemIntroText');
      if ($intro.length) {
        description = $intro.text().trim().slice(0, 200);
      }
      
      const articleUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      const slug = href.split('/').pop() || `item-${i}`;
      
      articles.push({
        id: `${category.toLowerCase()}-${i}-${slug}`,
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
  
  // Limit to 15 articles
  return articles.slice(0, 15);
}

// Main function to fetch all school articles
export async function fetchSchoolArticles(): Promise<SchoolArticle[]> {
  try {
    const [novinky, druzina] = await Promise.all([
      scrapeArticlesK2(NOVINKY_URL, 'Novinky'),
      scrapeArticlesK2(DRUZINA_URL, 'Družina'),
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
