import { AIResearch } from '@/types';

// arXiv API for AI/ML research papers
// Categories: cs.AI, cs.LG, cs.CL (NLP), stat.ML

interface ArxivEntry {
  id: string[];
  title: string[];
  summary: string[];
  author: Array<{ name: string[] }>;
  published: string[];
  'arxiv:primary_category': Array<{ $: { term: string } }>;
  link: Array<{ $: { href: string; type?: string } }>;
}

function cleanText(text: string): string {
  return text
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractId(fullId: string): string {
  // Extract just the arxiv ID from full URL
  const match = fullId.match(/(\d+\.\d+)/);
  return match ? match[1] : fullId;
}

async function fetchArxivPapers(category: string, maxResults: number = 10): Promise<AIResearch[]> {
  try {
    const url = `https://export.arxiv.org/api/query?search_query=cat:${category}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.error(`arXiv API error: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    
    // Simple XML parsing for arxiv entries
    const papers: AIResearch[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      
      const id = extractTag(entry, 'id') || '';
      const title = cleanText(extractTag(entry, 'title') || '');
      const summary = cleanText(extractTag(entry, 'summary') || '');
      const published = extractTag(entry, 'published') || '';
      
      // Extract authors
      const authors: string[] = [];
      const authorRegex = /<author>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/author>/g;
      let authorMatch;
      while ((authorMatch = authorRegex.exec(entry)) !== null && authors.length < 3) {
        authors.push(authorMatch[1].trim());
      }
      
      // Get PDF link
      const pdfMatch = entry.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/);
      const absMatch = entry.match(/<id>([^<]+)<\/id>/);
      const url = pdfMatch ? pdfMatch[1] : (absMatch ? absMatch[1] : '');
      
      // Get category
      const catMatch = entry.match(/term="([^"]+)"/);
      const cat = catMatch ? catMatch[1] : category;
      
      if (title && summary) {
        papers.push({
          id: `arxiv-${extractId(id)}`,
          title,
          authors,
          summary: summary.slice(0, 300) + (summary.length > 300 ? '...' : ''),
          url: url.replace('http://', 'https://'),
          category: formatCategory(cat),
          publishedAt: published,
        });
      }
    }
    
    return papers;
  } catch (error) {
    console.error(`Error fetching arXiv ${category}:`, error);
    return [];
  }
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function formatCategory(cat: string): string {
  const categories: Record<string, string> = {
    'cs.AI': 'Artificial Intelligence',
    'cs.LG': 'Machine Learning',
    'cs.CL': 'NLP & Language',
    'cs.CV': 'Computer Vision',
    'cs.NE': 'Neural Networks',
    'stat.ML': 'Statistical ML',
    'cs.RO': 'Robotics',
  };
  return categories[cat] || cat;
}

export async function fetchAIResearch(): Promise<AIResearch[]> {
  // Fetch from multiple AI-related categories
  const [aiPapers, mlPapers, nlpPapers] = await Promise.all([
    fetchArxivPapers('cs.AI', 5),
    fetchArxivPapers('cs.LG', 5),
    fetchArxivPapers('cs.CL', 3),
  ]);
  
  // Combine and sort by date
  const allPapers = [...aiPapers, ...mlPapers, ...nlpPapers];
  
  // Sort by published date (newest first)
  allPapers.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // Return top 10 unique papers
  const seen = new Set<string>();
  const unique: AIResearch[] = [];
  
  for (const paper of allPapers) {
    if (!seen.has(paper.title) && unique.length < 10) {
      seen.add(paper.title);
      unique.push(paper);
    }
  }
  
  return unique;
}
