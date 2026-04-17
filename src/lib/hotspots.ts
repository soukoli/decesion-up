import { GlobalHotspot } from '@/types';

// Fallback hotspots when APIs fail - major ongoing events
const FALLBACK_HOTSPOTS: GlobalHotspot[] = [
  {
    id: 'fallback-ukraine',
    lat: 48.3794,
    lng: 31.1656,
    country: 'Ukraine',
    region: 'Ukraine',
    eventCount: 50,
    topEvent: 'Ongoing conflict in Eastern Europe',
    category: 'conflict',
    intensity: 9,
    sources: ['BBC', 'Reuters', 'AP'],
    url: 'https://www.bbc.com/news/world-europe-56720589',
  },
  {
    id: 'fallback-israel',
    lat: 31.0461,
    lng: 34.8516,
    country: 'Israel',
    region: 'Middle East',
    eventCount: 40,
    topEvent: 'Middle East tensions continue',
    category: 'conflict',
    intensity: 9,
    sources: ['BBC', 'Guardian', 'NPR'],
    url: 'https://www.bbc.com/news/world-middle-east',
  },
  {
    id: 'fallback-usa',
    lat: 39.8283,
    lng: -98.5795,
    country: 'USA',
    region: 'United States',
    eventCount: 20,
    topEvent: 'Political developments ahead of elections',
    category: 'politics',
    intensity: 7,
    sources: ['NPR', 'BBC', 'Guardian'],
    url: 'https://www.npr.org/sections/politics/',
  },
  {
    id: 'fallback-china',
    lat: 35.8617,
    lng: 104.1954,
    country: 'China',
    region: 'China',
    eventCount: 15,
    topEvent: 'Economic policy changes and trade relations',
    category: 'economy',
    intensity: 6,
    sources: ['Reuters', 'BBC'],
    url: 'https://www.bbc.com/news/world-asia-china',
  },
  {
    id: 'fallback-eu',
    lat: 50.8503,
    lng: 4.3517,
    country: 'Belgium',
    region: 'European Union',
    eventCount: 10,
    topEvent: 'EU policy discussions and regulations',
    category: 'politics',
    intensity: 5,
    sources: ['Reuters', 'Guardian'],
    url: 'https://www.theguardian.com/world/eu',
  },
];

// Use ReliefWeb for humanitarian crisis data (fast and reliable)
export async function fetchReliefWebCrises(): Promise<GlobalHotspot[]> {
  try {
    const response = await fetch(
      'https://api.reliefweb.int/v1/disasters?appname=decisionup&preset=latest&limit=8',
      { 
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const hotspots: GlobalHotspot[] = [];
    
    for (const item of data.data || []) {
      const fields = item.fields;
      if (fields.country && fields.country.length > 0) {
        const country = fields.country[0];
        
        // Skip if no valid coordinates
        if (!country.location?.lat || !country.location?.lon) continue;
        
        hotspots.push({
          id: `relief-${item.id}`,
          lat: country.location.lat,
          lng: country.location.lon,
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

// Fetch ACLED conflict data (fast API)
export async function fetchConflictData(): Promise<GlobalHotspot[]> {
  // ACLED requires API key, so we'll use a simple fallback approach
  // Return empty - we'll rely on ReliefWeb + fallback
  return [];
}

export async function fetchAllHotspots(): Promise<GlobalHotspot[]> {
  try {
    const reliefHotspots = await fetchReliefWebCrises();
    
    if (reliefHotspots.length > 0) {
      // Combine with some fallback hotspots for major regions not covered
      const coveredCountries = new Set(reliefHotspots.map(h => h.country));
      const additionalHotspots = FALLBACK_HOTSPOTS.filter(
        h => !coveredCountries.has(h.country)
      ).slice(0, 3); // Add up to 3 fallback hotspots
      
      return [...reliefHotspots, ...additionalHotspots].sort((a, b) => b.intensity - a.intensity);
    }
    
    // If ReliefWeb fails, return fallback data
    console.log('Using fallback hotspots data');
    return FALLBACK_HOTSPOTS;
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    return FALLBACK_HOTSPOTS;
  }
}
