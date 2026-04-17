import { GlobalHotspot } from '@/types';

// GDELT GKG (Global Knowledge Graph) provides event data with locations
// We'll use their public API to get recent events by location

interface GDELTEvent {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

interface GDELTResponse {
  articles?: GDELTEvent[];
}

// Major world regions with coordinates for aggregation
const WORLD_REGIONS = [
  { name: 'United States', lat: 39.8283, lng: -98.5795, country: 'USA' },
  { name: 'United Kingdom', lat: 55.3781, lng: -3.4360, country: 'UK' },
  { name: 'Germany', lat: 51.1657, lng: 10.4515, country: 'Germany' },
  { name: 'France', lat: 46.2276, lng: 2.2137, country: 'France' },
  { name: 'Ukraine', lat: 48.3794, lng: 31.1656, country: 'Ukraine' },
  { name: 'Russia', lat: 61.5240, lng: 105.3188, country: 'Russia' },
  { name: 'China', lat: 35.8617, lng: 104.1954, country: 'China' },
  { name: 'Japan', lat: 36.2048, lng: 138.2529, country: 'Japan' },
  { name: 'India', lat: 20.5937, lng: 78.9629, country: 'India' },
  { name: 'Brazil', lat: -14.2350, lng: -51.9253, country: 'Brazil' },
  { name: 'Australia', lat: -25.2744, lng: 133.7751, country: 'Australia' },
  { name: 'South Africa', lat: -30.5595, lng: 22.9375, country: 'South Africa' },
  { name: 'Middle East', lat: 29.2985, lng: 42.5510, country: 'Middle East' },
  { name: 'Israel', lat: 31.0461, lng: 34.8516, country: 'Israel' },
  { name: 'Turkey', lat: 38.9637, lng: 35.2433, country: 'Turkey' },
  { name: 'Poland', lat: 51.9194, lng: 19.1451, country: 'Poland' },
  { name: 'Czech Republic', lat: 49.8175, lng: 15.4730, country: 'Czechia' },
];

// Categorize events based on keywords in title
function categorizeEvent(title: string): GlobalHotspot['category'] {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('war') || lowerTitle.includes('military') || 
      lowerTitle.includes('attack') || lowerTitle.includes('strike') ||
      lowerTitle.includes('conflict') || lowerTitle.includes('army')) {
    return 'conflict';
  }
  if (lowerTitle.includes('protest') || lowerTitle.includes('demonstration') ||
      lowerTitle.includes('rally') || lowerTitle.includes('march')) {
    return 'protest';
  }
  if (lowerTitle.includes('earthquake') || lowerTitle.includes('flood') ||
      lowerTitle.includes('hurricane') || lowerTitle.includes('disaster') ||
      lowerTitle.includes('fire') || lowerTitle.includes('storm')) {
    return 'disaster';
  }
  if (lowerTitle.includes('economy') || lowerTitle.includes('market') ||
      lowerTitle.includes('trade') || lowerTitle.includes('inflation') ||
      lowerTitle.includes('gdp') || lowerTitle.includes('bank')) {
    return 'economy';
  }
  return 'politics';
}

// Fetch events for a specific country using GDELT DOC API
async function fetchCountryEvents(country: string): Promise<GDELTEvent[]> {
  try {
    // GDELT DOC 2.0 API - free, no auth required
    const query = encodeURIComponent(country);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=5&format=json&sort=datedesc`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'DecisionUp/1.0'
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data: GDELTResponse = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error(`Error fetching GDELT data for ${country}:`, error);
    return [];
  }
}

export async function fetchGlobalHotspots(): Promise<GlobalHotspot[]> {
  const hotspots: GlobalHotspot[] = [];
  
  // Fetch data for key regions (limit to avoid too many requests)
  const keyRegions = WORLD_REGIONS.slice(0, 12);
  
  const results = await Promise.allSettled(
    keyRegions.map(async (region) => {
      const events = await fetchCountryEvents(region.country);
      return { region, events };
    })
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.events.length > 0) {
      const { region, events } = result.value;
      const topEvent = events[0];
      
      // Calculate intensity based on number of articles
      const intensity = Math.min(10, Math.ceil(events.length * 2));
      
      hotspots.push({
        id: `hotspot-${region.country}-${Date.now()}`,
        lat: region.lat,
        lng: region.lng,
        country: region.country,
        region: region.name,
        eventCount: events.length,
        topEvent: topEvent.title || 'Recent activity',
        category: categorizeEvent(topEvent.title || ''),
        intensity,
        sources: events.map(e => e.domain).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3),
        url: topEvent.url,
      });
    }
  });
  
  // Sort by intensity (most active first)
  return hotspots.sort((a, b) => b.intensity - a.intensity);
}

// Alternative: Use ReliefWeb for humanitarian crisis data (more reliable)
export async function fetchReliefWebCrises(): Promise<GlobalHotspot[]> {
  try {
    const response = await fetch(
      'https://api.reliefweb.int/v1/disasters?appname=decisionup&preset=latest&limit=10',
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const hotspots: GlobalHotspot[] = [];
    
    for (const item of data.data || []) {
      const fields = item.fields;
      if (fields.country && fields.country.length > 0) {
        const country = fields.country[0];
        
        hotspots.push({
          id: `relief-${item.id}`,
          lat: country.location?.lat || 0,
          lng: country.location?.lon || 0,
          country: country.name,
          region: country.name,
          eventCount: 1,
          topEvent: fields.name,
          category: 'disaster',
          intensity: 8,
          sources: ['ReliefWeb', 'UN OCHA'],
          url: fields.url_alias ? `https://reliefweb.int${fields.url_alias}` : undefined,
        });
      }
    }
    
    return hotspots;
  } catch (error) {
    console.error('Error fetching ReliefWeb data:', error);
    return [];
  }
}

export async function fetchAllHotspots(): Promise<GlobalHotspot[]> {
  const [gdeltHotspots, reliefHotspots] = await Promise.all([
    fetchGlobalHotspots(),
    fetchReliefWebCrises(),
  ]);
  
  // Combine and deduplicate by country
  const combined = [...gdeltHotspots];
  
  for (const relief of reliefHotspots) {
    const exists = combined.find(h => h.country === relief.country);
    if (!exists) {
      combined.push(relief);
    } else if (relief.category === 'disaster') {
      // Disaster takes priority
      exists.category = 'disaster';
      exists.topEvent = relief.topEvent;
      exists.intensity = Math.max(exists.intensity, relief.intensity);
    }
  }
  
  return combined.sort((a, b) => b.intensity - a.intensity);
}
