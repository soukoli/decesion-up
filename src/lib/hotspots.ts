import { GlobalHotspot } from '@/types';
import { fetchGDACSData } from './gdacs';
import { fetchUSGSData } from './usgs';

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

// Fetch ACLED conflict data with provided token
export async function fetchACLEDWithToken(accessToken: string): Promise<GlobalHotspot[]> {
  // Import dynamically to avoid circular deps
  const { fetchACLEDData } = await import('./acled');
  return fetchACLEDData(accessToken);
}

// Combine all data sources
export async function fetchAllHotspots(acledToken?: string): Promise<GlobalHotspot[]> {
  try {
    // Fetch from all sources in parallel
    const [gdacsHotspots, usgsHotspots, reliefHotspots] = await Promise.all([
      fetchGDACSData().catch(err => {
        console.error('GDACS fetch failed:', err);
        return [];
      }),
      fetchUSGSData().catch(err => {
        console.error('USGS fetch failed:', err);
        return [];
      }),
      fetchReliefWebCrises().catch(err => {
        console.error('ReliefWeb fetch failed:', err);
        return [];
      }),
    ]);

    // Optionally fetch ACLED if token is provided
    let acledHotspots: GlobalHotspot[] = [];
    if (acledToken) {
      try {
        acledHotspots = await fetchACLEDWithToken(acledToken);
      } catch (err) {
        console.error('ACLED fetch failed:', err);
      }
    }

    // Combine all hotspots
    const allHotspots = [
      ...gdacsHotspots,
      ...usgsHotspots,
      ...reliefHotspots,
      ...acledHotspots,
    ];

    console.log(`Fetched hotspots: GDACS=${gdacsHotspots.length}, USGS=${usgsHotspots.length}, ReliefWeb=${reliefHotspots.length}, ACLED=${acledHotspots.length}`);

    if (allHotspots.length > 0) {
      // Deduplicate by proximity (within ~100km)
      const deduped = deduplicateByProximity(allHotspots);
      
      // Sort by intensity and return
      return deduped.sort((a, b) => b.intensity - a.intensity);
    }
    
    // If all APIs fail, return fallback data
    console.log('Using fallback hotspots data');
    return FALLBACK_HOTSPOTS;
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    return FALLBACK_HOTSPOTS;
  }
}

// Deduplicate hotspots that are close to each other (same event from multiple sources)
function deduplicateByProximity(hotspots: GlobalHotspot[], thresholdKm: number = 100): GlobalHotspot[] {
  const result: GlobalHotspot[] = [];
  
  for (const hotspot of hotspots) {
    // Check if there's already a hotspot nearby
    const existing = result.find(h => 
      getDistanceKm(h.lat, h.lng, hotspot.lat, hotspot.lng) < thresholdKm
    );
    
    if (existing) {
      // Merge: keep the one with higher intensity, add sources
      if (hotspot.intensity > existing.intensity) {
        // Replace with higher intensity
        const idx = result.indexOf(existing);
        hotspot.sources = [...new Set([...existing.sources, ...hotspot.sources])];
        hotspot.eventCount = Math.max(existing.eventCount, hotspot.eventCount);
        result[idx] = hotspot;
      } else {
        // Just add sources to existing
        existing.sources = [...new Set([...existing.sources, ...hotspot.sources])];
        existing.eventCount = Math.max(existing.eventCount, hotspot.eventCount);
      }
    } else {
      result.push(hotspot);
    }
  }
  
  return result;
}

// Haversine formula to calculate distance between two points
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
