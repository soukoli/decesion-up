// GDACS (Global Disaster Alert and Coordination System) RSS parser
// Source: https://www.gdacs.org/xml/rss.xml

import { GlobalHotspot } from '@/types';

interface GDACSEvent {
  eventId: string;
  eventType: 'EQ' | 'TC' | 'FL' | 'VO' | 'WF' | 'DR'; // Earthquake, Tropical Cyclone, Flood, Volcano, Wildfire, Drought
  alertLevel: 'Green' | 'Orange' | 'Red';
  title: string;
  description: string;
  lat: number;
  lng: number;
  country: string;
  pubDate: string;
  severity: number;
  population?: number;
  url?: string;
}

// Map GDACS event types to our categories
const eventTypeToCategory: Record<string, GlobalHotspot['category']> = {
  'EQ': 'disaster',
  'TC': 'disaster',
  'FL': 'disaster',
  'VO': 'disaster',
  'WF': 'disaster',
  'DR': 'economy', // Droughts often have economic impact
};

// Map alert levels to intensity
const alertToIntensity: Record<string, number> = {
  'Green': 4,
  'Orange': 7,
  'Red': 10,
};

export async function fetchGDACSData(): Promise<GlobalHotspot[]> {
  try {
    const response = await fetch('https://www.gdacs.org/xml/rss.xml', {
      headers: {
        'User-Agent': 'DecisionUp/1.0',
      },
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      console.error('GDACS fetch error:', response.status);
      return [];
    }

    const xmlText = await response.text();
    const events = parseGDACSXml(xmlText);

    // Filter to only Orange and Red alerts (significant disasters)
    // Green alerts are minor events that would overwhelm the map
    const significantEvents = events.filter(event => 
      event.alertLevel === 'Orange' || event.alertLevel === 'Red'
    );

    // Convert to hotspots
    const hotspots: GlobalHotspot[] = significantEvents.map(event => ({
      id: `gdacs-${event.eventId}`,
      lat: event.lat,
      lng: event.lng,
      country: event.country,
      region: event.country,
      eventCount: 1,
      topEvent: formatGDACSDescription(event),
      category: eventTypeToCategory[event.eventType] || 'disaster',
      intensity: alertToIntensity[event.alertLevel] || 5,
      sources: ['GDACS', 'UN/EU'],
      url: event.url,
    }));

    return hotspots;
  } catch (error) {
    console.error('Error fetching GDACS data:', error);
    return [];
  }
}

function parseGDACSXml(xml: string): GDACSEvent[] {
  const events: GDACSEvent[] = [];
  
  // Parse RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    try {
      const event = parseGDACSItem(itemXml);
      if (event) {
        events.push(event);
      }
    } catch (e) {
      console.error('Error parsing GDACS item:', e);
    }
  }

  return events;
}

function parseGDACSItem(xml: string): GDACSEvent | null {
  const title = extractTag(xml, 'title');
  const description = extractTag(xml, 'description');
  const link = extractTag(xml, 'link');
  const pubDate = extractTag(xml, 'pubDate');
  
  // Extract GDACS-specific fields from georss namespace
  const lat = extractTag(xml, 'geo:lat') || extractGeoRSSPoint(xml, 'lat');
  const lng = extractTag(xml, 'geo:long') || extractGeoRSSPoint(xml, 'lng');
  
  // Extract GDACS namespace fields
  const eventType = extractTag(xml, 'gdacs:eventtype');
  const alertLevel = extractTag(xml, 'gdacs:alertlevel');
  const severity = extractTag(xml, 'gdacs:severity');
  const country = extractTag(xml, 'gdacs:country') || extractCountryFromTitle(title || '');
  const population = extractTag(xml, 'gdacs:population');
  const eventId = extractTag(xml, 'gdacs:eventid') || extractEventIdFromLink(link || '');

  if (!title || !lat || !lng) {
    return null;
  }

  return {
    eventId: eventId || `gdacs-${Date.now()}`,
    eventType: (eventType as GDACSEvent['eventType']) || 'EQ',
    alertLevel: (alertLevel as GDACSEvent['alertLevel']) || 'Green',
    title: cleanHtml(title),
    description: cleanHtml(description || ''),
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    country: country || 'Unknown',
    pubDate: pubDate || new Date().toISOString(),
    severity: parseFloat(severity || '0'),
    population: population ? parseInt(population, 10) : undefined,
    url: link || undefined,
  };
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

function extractGeoRSSPoint(xml: string, coord: 'lat' | 'lng'): string | null {
  // Try georss:point format: "lat lng"
  const pointMatch = xml.match(/<georss:point>([^<]+)<\/georss:point>/i);
  if (pointMatch) {
    const parts = pointMatch[1].trim().split(/\s+/);
    return coord === 'lat' ? parts[0] : parts[1];
  }
  return null;
}

function extractCountryFromTitle(title: string): string {
  // GDACS titles often contain country name
  // Example: "Green earthquake alert (Magnitude 5.2M, Depth:10km) in Japan"
  const match = title.match(/in\s+([A-Z][a-zA-Z\s]+?)(?:\s*$|,|\s+-)/);
  return match ? match[1].trim() : 'Unknown';
}

function extractEventIdFromLink(link: string): string {
  const match = link.match(/eventid=(\d+)/);
  return match ? match[1] : `unknown-${Date.now()}`;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function formatGDACSDescription(event: GDACSEvent): string {
  const typeNames: Record<string, string> = {
    'EQ': 'Earthquake',
    'TC': 'Tropical Cyclone',
    'FL': 'Flood',
    'VO': 'Volcanic Activity',
    'WF': 'Wildfire',
    'DR': 'Drought',
  };

  const parts: string[] = [];
  
  // Alert level and type
  parts.push(`${event.alertLevel} alert:`);
  parts.push(typeNames[event.eventType] || event.eventType);
  
  // Location
  parts.push(`in ${event.country}`);

  // Population affected
  if (event.population && event.population > 0) {
    const formatted = event.population > 1000000 
      ? `${(event.population / 1000000).toFixed(1)}M`
      : event.population > 1000 
        ? `${(event.population / 1000).toFixed(0)}K`
        : event.population.toString();
    parts.push(`- ${formatted} people potentially affected`);
  }

  return parts.join(' ');
}
