import { GlobalHotspot } from '@/types';
import { fetchGDACSData } from './gdacs';
import { fetchUSGSData } from './usgs';

// Core geopolitical hotspots - these are ALWAYS included
// These represent ongoing major conflicts and crises that should always be visible
const GEOPOLITICAL_HOTSPOTS: GlobalHotspot[] = [
  {
    id: 'geo-ukraine',
    lat: 48.3794,
    lng: 31.1656,
    country: 'Ukraine',
    region: 'Eastern Europe',
    eventCount: 50,
    topEvent: 'Russia-Ukraine war: Ongoing military conflict since 2022',
    category: 'conflict',
    intensity: 10,
    sources: ['BBC', 'Reuters', 'AP', 'UN'],
    url: 'https://www.bbc.com/news/world-europe-56720589',
  },
  {
    id: 'geo-gaza',
    lat: 31.3547,
    lng: 34.3088,
    country: 'Palestine',
    region: 'Gaza Strip',
    eventCount: 45,
    topEvent: 'Israel-Gaza conflict: Humanitarian crisis continues',
    category: 'conflict',
    intensity: 10,
    sources: ['BBC', 'Guardian', 'UN OCHA', 'Reuters'],
    url: 'https://www.bbc.com/news/world-middle-east',
  },
  {
    id: 'geo-sudan',
    lat: 15.5007,
    lng: 32.5599,
    country: 'Sudan',
    region: 'East Africa',
    eventCount: 30,
    topEvent: 'Sudan civil war: RSF-military conflict causes mass displacement',
    category: 'conflict',
    intensity: 9,
    sources: ['Reuters', 'UN', 'Al Jazeera'],
    url: 'https://www.aljazeera.com/tag/sudan/',
  },
  {
    id: 'geo-myanmar',
    lat: 21.9162,
    lng: 95.956,
    country: 'Myanmar',
    region: 'Southeast Asia',
    eventCount: 25,
    topEvent: 'Myanmar civil war: Military junta faces widespread resistance',
    category: 'conflict',
    intensity: 8,
    sources: ['BBC', 'Reuters', 'Myanmar Now'],
    url: 'https://www.bbc.com/news/world-asia-pacific-11685977',
  },
  {
    id: 'geo-yemen',
    lat: 15.5527,
    lng: 48.5164,
    country: 'Yemen',
    region: 'Middle East',
    eventCount: 20,
    topEvent: 'Yemen conflict: Red Sea tensions and Houthi attacks',
    category: 'conflict',
    intensity: 8,
    sources: ['BBC', 'Al Jazeera', 'Reuters'],
    url: 'https://www.aljazeera.com/tag/yemen/',
  },
  {
    id: 'geo-haiti',
    lat: 18.9712,
    lng: -72.2852,
    country: 'Haiti',
    region: 'Caribbean',
    eventCount: 15,
    topEvent: 'Haiti gang crisis: Violence and humanitarian emergency',
    category: 'conflict',
    intensity: 8,
    sources: ['Reuters', 'AP', 'UN'],
    url: 'https://www.reuters.com/world/americas/haiti/',
  },
  {
    id: 'geo-drc',
    lat: -4.0383,
    lng: 21.7587,
    country: 'DR Congo',
    region: 'Central Africa',
    eventCount: 20,
    topEvent: 'DRC conflict: M23 rebels and regional tensions in eastern Congo',
    category: 'conflict',
    intensity: 8,
    sources: ['UN', 'Reuters', 'Al Jazeera'],
    url: 'https://www.aljazeera.com/tag/democratic-republic-of-congo/',
  },
];

// Fallback disaster hotspots - used only when APIs completely fail
const FALLBACK_DISASTERS: GlobalHotspot[] = [
  {
    id: 'fallback-usa',
    lat: 39.8283,
    lng: -98.5795,
    country: 'USA',
    region: 'United States',
    eventCount: 10,
    topEvent: 'US: Political developments and economic policy',
    category: 'politics',
    intensity: 6,
    sources: ['NPR', 'BBC', 'Reuters'],
    url: 'https://www.npr.org/sections/politics/',
  },
  {
    id: 'fallback-china',
    lat: 35.8617,
    lng: 104.1954,
    country: 'China',
    region: 'China',
    eventCount: 10,
    topEvent: 'China: Economic shifts and trade relations',
    category: 'economy',
    intensity: 6,
    sources: ['Reuters', 'BBC'],
    url: 'https://www.bbc.com/news/world-asia-china',
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

    // ALWAYS start with core geopolitical hotspots (wars, conflicts)
    // These are the most important events that should always be visible
    const allHotspots = [
      ...GEOPOLITICAL_HOTSPOTS,
      ...gdacsHotspots,
      ...usgsHotspots,
      ...reliefHotspots,
      ...acledHotspots,
    ];

    console.log(`Fetched hotspots: Geopolitical=${GEOPOLITICAL_HOTSPOTS.length}, GDACS=${gdacsHotspots.length}, USGS=${usgsHotspots.length}, ReliefWeb=${reliefHotspots.length}, ACLED=${acledHotspots.length}`);

    // Deduplicate by proximity (within ~100km)
    // This will merge any API data that overlaps with geopolitical hotspots
    const deduped = deduplicateByProximity(allHotspots);
    
    // Sort by intensity and return
    return deduped.sort((a, b) => b.intensity - a.intensity);
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    // If everything fails, still return geopolitical + fallback
    return [...GEOPOLITICAL_HOTSPOTS, ...FALLBACK_DISASTERS];
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
