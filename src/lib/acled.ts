// ACLED API client for conflict data
// Documentation: https://acleddata.com/api-documentation/getting-started

import { GlobalHotspot } from '@/types';

interface ACLEDEvent {
  event_id_cnty: string;
  event_date: string;
  year: string;
  event_type: string;
  sub_event_type: string;
  actor1: string;
  actor2?: string;
  country: string;
  region: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  location: string;
  latitude: string;
  longitude: string;
  fatalities: string;
  notes?: string;
  source?: string;
  timestamp: string;
}

interface ACLEDResponse {
  status: number;
  success: boolean;
  count: number;
  data: ACLEDEvent[];
}

// Map ACLED event types to our categories
const eventTypeMapping: Record<string, GlobalHotspot['category']> = {
  'Battles': 'conflict',
  'Violence against civilians': 'conflict',
  'Explosions/Remote violence': 'conflict',
  'Riots': 'protest',
  'Protests': 'protest',
  'Strategic developments': 'politics',
};

export async function fetchACLEDData(accessToken: string): Promise<GlobalHotspot[]> {
  try {
    // Get events from the last 7 days
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    // Build API URL with filters
    const params = new URLSearchParams({
      '_format': 'json',
      'event_date': `${startDate}|${endDate}`,
      'event_date_where': 'BETWEEN',
      // Focus on significant events (with fatalities or major protests)
      'limit': '500',
      'fields': 'event_id_cnty|event_date|event_type|sub_event_type|actor1|country|region|admin1|location|latitude|longitude|fatalities|notes|source',
    });

    const response = await fetch(
      `https://acleddata.com/api/acled/read?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('ACLED API error:', response.status);
      return [];
    }

    const data: ACLEDResponse = await response.json();

    if (!data.success || !data.data) {
      console.error('ACLED API returned no data');
      return [];
    }

    // Group events by location (country + region)
    const grouped = new Map<string, ACLEDEvent[]>();
    
    data.data.forEach(event => {
      const key = `${event.country}-${event.region || event.admin1 || 'Unknown'}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(event);
    });

    // Convert to hotspots
    const hotspots: GlobalHotspot[] = [];

    grouped.forEach((events, key) => {
      // Calculate aggregate stats
      const totalFatalities = events.reduce((sum, e) => sum + parseInt(e.fatalities || '0', 10), 0);
      const eventCount = events.length;
      
      // Find the most significant event (most fatalities or most recent)
      const topEvent = events.sort((a, b) => {
        const fatalA = parseInt(a.fatalities || '0', 10);
        const fatalB = parseInt(b.fatalities || '0', 10);
        if (fatalA !== fatalB) return fatalB - fatalA;
        return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
      })[0];

      // Calculate intensity (1-10 scale)
      let intensity = 3; // Base intensity
      if (totalFatalities > 100) intensity = 10;
      else if (totalFatalities > 50) intensity = 9;
      else if (totalFatalities > 20) intensity = 8;
      else if (totalFatalities > 10) intensity = 7;
      else if (totalFatalities > 5) intensity = 6;
      else if (totalFatalities > 0) intensity = 5;
      else if (eventCount > 10) intensity = 5;
      else if (eventCount > 5) intensity = 4;

      // Map event type to category
      const category = eventTypeMapping[topEvent.event_type] || 'politics';

      hotspots.push({
        id: `acled-${key}`,
        lat: parseFloat(topEvent.latitude),
        lng: parseFloat(topEvent.longitude),
        country: topEvent.country,
        region: topEvent.admin1 || topEvent.region || topEvent.country,
        eventCount,
        topEvent: formatEventDescription(topEvent, totalFatalities),
        category,
        intensity,
        sources: ['ACLED'],
        url: `https://acleddata.com/conflict-data/data-export-tool/?country=${encodeURIComponent(topEvent.country)}`,
      });
    });

    // Sort by intensity and return top 20
    return hotspots
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 20);

  } catch (error) {
    console.error('Error fetching ACLED data:', error);
    return [];
  }
}

function formatEventDescription(event: ACLEDEvent, totalFatalities: number): string {
  const fatalities = parseInt(event.fatalities || '0', 10);
  const parts: string[] = [];

  // Event type
  parts.push(event.event_type);
  
  // Sub-event type if different
  if (event.sub_event_type && event.sub_event_type !== event.event_type) {
    parts.push(`(${event.sub_event_type})`);
  }

  // Actor
  if (event.actor1) {
    parts.push(`involving ${event.actor1}`);
  }

  // Location
  parts.push(`in ${event.location || event.admin1 || event.country}`);

  // Fatalities
  if (totalFatalities > 0) {
    parts.push(`- ${totalFatalities} reported fatalities in the region`);
  }

  return parts.join(' ');
}

// Validate and refresh token if needed
export async function getValidACLEDToken(
  accessToken: string | null,
  refreshToken: string | null,
  expiresAt: number | null
): Promise<{ accessToken: string; refreshToken: string; expiresAt: number } | null> {
  // Check if current token is valid
  if (accessToken && expiresAt && Date.now() < expiresAt - 60000) { // 1 minute buffer
    return { accessToken, refreshToken: refreshToken || '', expiresAt };
  }

  // Try to refresh
  if (refreshToken) {
    try {
      const response = await fetch('/api/acled/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + (data.expires_in * 1000),
        };
      }
    } catch (error) {
      console.error('Error refreshing ACLED token:', error);
    }
  }

  return null;
}
