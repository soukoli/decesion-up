import { GlobalHotspot } from '@/types';
import { fetchGDACSData } from './gdacs';
import { fetchUSGSData } from './usgs';

// Minimal fallback when ALL APIs fail - just to show something on the map
// These are NOT primary sources - ACLED is the primary source for conflicts
const FALLBACK_HOTSPOTS: GlobalHotspot[] = [
  {
    id: 'fallback-notice',
    lat: 0,
    lng: 0,
    country: 'Notice',
    region: 'Data Loading',
    eventCount: 0,
    topEvent: 'Configure ACLED credentials in Settings for live conflict data',
    category: 'politics',
    intensity: 1,
    sources: ['System'],
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

    // Combine all hotspots - ACLED conflicts are primary, disasters are supplementary
    const allHotspots = [
      ...acledHotspots,      // ACLED conflicts first (primary source)
      ...gdacsHotspots,      // Significant disasters (Orange/Red alerts only)
      ...usgsHotspots,       // Major earthquakes (M5.5+)
      ...reliefHotspots,     // Humanitarian crises
    ];

    console.log(`Fetched hotspots: ACLED=${acledHotspots.length}, GDACS=${gdacsHotspots.length}, USGS=${usgsHotspots.length}, ReliefWeb=${reliefHotspots.length}`);

    if (allHotspots.length > 0) {
      // Deduplicate by proximity (within ~100km)
      const deduped = deduplicateByProximity(allHotspots);
      
      // Sort by intensity and return
      return deduped.sort((a, b) => b.intensity - a.intensity);
    }

    // If ALL APIs return nothing (no data or all failed), return fallback
    console.log('No hotspots data available - showing notice');
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
