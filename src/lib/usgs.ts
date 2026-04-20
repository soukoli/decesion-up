// USGS Earthquake API
// Documentation: https://earthquake.usgs.gov/fdsnws/event/1/

import { GlobalHotspot } from '@/types';

interface USGSFeature {
  type: 'Feature';
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz: number | null;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: 'green' | 'yellow' | 'orange' | 'red' | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number;
    gap: number | null;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
  id: string;
}

interface USGSResponse {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: USGSFeature[];
}

// Map USGS alert levels to intensity
const alertToIntensity: Record<string, number> = {
  'green': 5,
  'yellow': 7,
  'orange': 9,
  'red': 10,
};

// Calculate intensity from magnitude if no alert level
function magnitudeToIntensity(mag: number): number {
  if (mag >= 8) return 10;
  if (mag >= 7) return 9;
  if (mag >= 6.5) return 8;
  if (mag >= 6) return 7;
  if (mag >= 5.5) return 6;
  if (mag >= 5) return 5;
  if (mag >= 4.5) return 4;
  return 3;
}

export async function fetchUSGSData(): Promise<GlobalHotspot[]> {
  try {
    // Get significant earthquakes from the last 7 days
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // API parameters - M5.5+ are significant earthquakes
    const params = new URLSearchParams({
      format: 'geojson',
      starttime: startTime.split('T')[0],
      endtime: endTime.split('T')[0],
      minmagnitude: '5.5', // Only truly significant earthquakes
      orderby: 'magnitude',
      limit: '20', // Limit to top 20
    });

    const response = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'DecisionUp/1.0',
        },
        next: { revalidate: 900 }, // Cache for 15 minutes
      }
    );

    if (!response.ok) {
      console.error('USGS fetch error:', response.status);
      return [];
    }

    const data: USGSResponse = await response.json();

    if (!data.features || data.features.length === 0) {
      return [];
    }

    // Convert to hotspots
    const hotspots: GlobalHotspot[] = data.features.map(feature => {
      const { properties, geometry, id } = feature;
      const [lng, lat, depth] = geometry.coordinates;

      // Extract country from place string (e.g., "10km N of Tokyo, Japan" -> "Japan")
      const country = extractCountry(properties.place);

      // Calculate intensity
      const intensity = properties.alert 
        ? alertToIntensity[properties.alert] 
        : magnitudeToIntensity(properties.mag);

      return {
        id: `usgs-${id}`,
        lat,
        lng,
        country,
        region: properties.place,
        eventCount: 1,
        topEvent: formatEarthquakeDescription(properties, depth),
        category: 'disaster' as const,
        intensity,
        sources: ['USGS'],
        url: properties.url,
      };
    });

    return hotspots;
  } catch (error) {
    console.error('Error fetching USGS data:', error);
    return [];
  }
}

function extractCountry(place: string): string {
  // Place format is usually "distance from Location, Country"
  // or just "Region" for US earthquakes
  
  // Try to extract country after last comma
  const parts = place.split(',');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    // Check if it's a US state
    const usStates = ['Alaska', 'California', 'Hawaii', 'Nevada', 'Oklahoma', 'Texas', 'Washington', 'Oregon', 'Montana', 'Utah', 'Idaho', 'Arizona', 'New Mexico', 'Colorado', 'Wyoming'];
    if (usStates.some(state => lastPart.includes(state))) {
      return 'United States';
    }
    return lastPart;
  }
  
  // Check for common patterns
  if (place.toLowerCase().includes('alaska') || place.toLowerCase().includes('california')) {
    return 'United States';
  }
  
  return 'Unknown';
}

function formatEarthquakeDescription(props: USGSFeature['properties'], depth: number): string {
  const parts: string[] = [];

  // Magnitude
  parts.push(`M${props.mag.toFixed(1)} earthquake`);

  // Location
  parts.push(`near ${props.place}`);

  // Depth
  const depthKm = Math.round(depth);
  parts.push(`at ${depthKm}km depth`);

  // Tsunami warning
  if (props.tsunami === 1) {
    parts.push('- TSUNAMI WARNING');
  }

  // Alert level
  if (props.alert) {
    parts.push(`(${props.alert.toUpperCase()} alert)`);
  }

  // Felt reports
  if (props.felt && props.felt > 0) {
    parts.push(`- ${props.felt} felt reports`);
  }

  return parts.join(' ');
}
