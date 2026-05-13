import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 300; // Cache 5 minutes

interface TransportAlert {
  id: string;
  lines: string[];
  type: 'metro' | 'tram' | 'bus' | 'train' | 'other';
  category: 'mimoradnost' | 'vyluka' | 'zmena';
  title: string;
  timeRange: string;
  severity: 'high' | 'medium' | 'low';
  url: string;
}

// Lines we care about for daily briefing
const METRO_LINES = ['A', 'B', 'C'];
const KEY_TRAM_LINES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '20', '22', '23', '24', '25', '26'];

function classifyType(lines: string[]): 'metro' | 'tram' | 'bus' | 'train' | 'other' {
  if (lines.some(l => METRO_LINES.includes(l))) return 'metro';
  if (lines.some(l => l.startsWith('S') || l.startsWith('R') || l.startsWith('L') || l.startsWith('U'))) return 'train';
  if (lines.some(l => KEY_TRAM_LINES.includes(l))) return 'tram';
  if (lines.some(l => /^\d{3}$/.test(l))) return 'bus';
  return 'other';
}

function classifySeverity(category: string, type: string): 'high' | 'medium' | 'low' {
  if (type === 'metro' && category === 'mimoradnost') return 'high';
  if (type === 'metro') return 'high';
  if (category === 'mimoradnost') return 'medium';
  return 'low';
}

function isRelevantForBriefing(alert: TransportAlert): boolean {
  // We only care about metro, key tram lines, and active mimořádnosti
  if (alert.type === 'metro') return true;
  if (alert.type === 'tram' && alert.category === 'mimoradnost') return true;
  if (alert.type === 'tram' && alert.category === 'vyluka') return true;
  return false;
}

export async function GET() {
  try {
    const response = await fetch('https://pid.cz/zmeny/', {
      headers: {
        'User-Agent': 'DecisionUp/1.0 (Personal Dashboard)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ alerts: [], error: 'PID.cz unavailable' }, { status: 200 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const alerts: TransportAlert[] = [];

    // Parse alert items from the page
    $('a[href*="/zmena/"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const text = $el.text().trim();
      
      if (!text || !href) return;

      // Extract lines (bold elements at the start, or comma-separated line identifiers)
      const linesText = $el.find('strong').first().text().trim();
      const lines = linesText
        .split(/[,\s]+/)
        .map(l => l.trim())
        .filter(l => l.length > 0 && l.length <= 5);

      // Extract category
      let category: 'mimoradnost' | 'vyluka' | 'zmena' = 'zmena';
      const categoryText = text.toLowerCase();
      if (categoryText.includes('mimořádnost')) category = 'mimoradnost';
      else if (categoryText.includes('výluka')) category = 'vyluka';

      // Extract title (main description after category)
      const titleMatch = text.match(/(?:Mimořádnost|Výluka|Trvalá změna)\s*([\s\S]*?)(?:Zpoždění|Odklon|Přerušení|Změna|Omezení|Náhradní|Uzavření|Zastávka|Posílení)/);
      const title = titleMatch?.[1]?.trim() || text.substring(0, 100);

      // Extract time range
      const timeMatch = text.match(/(\d{1,2}\.\s*\d{1,2}\.?\s*\d{0,4}[\s\S]*?(?:do odvolání|\d{1,2}:\d{2}|\d{1,2}\.\s*\d{1,2}\.?\s*\d{4}))/);
      const timeRange = timeMatch?.[1]?.trim() || '';

      if (lines.length === 0) return;

      const type = classifyType(lines);
      const severity = classifySeverity(category, type);

      const alert: TransportAlert = {
        id: href,
        lines,
        type,
        category,
        title: title.replace(/\s+/g, ' ').trim(),
        timeRange,
        severity,
        url: href.startsWith('http') ? href : `https://pid.cz${href}`,
      };

      if (isRelevantForBriefing(alert)) {
        alerts.push(alert);
      }
    });

    // Sort by severity (high first) and limit to top 5
    alerts.sort((a, b) => {
      const sev = { high: 0, medium: 1, low: 2 };
      return sev[a.severity] - sev[b.severity];
    });

    return NextResponse.json({
      alerts: alerts.slice(0, 5),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching transport data:', error);
    return NextResponse.json({ alerts: [], error: 'Failed to fetch transport data' }, { status: 200 });
  }
}
