import { NextResponse } from 'next/server';
import { fetchAllHotspots } from '@/lib/hotspots';

// ISR - revalidate every 30 minutes
export const revalidate = 1800;

export async function GET() {
  try {
    const hotspots = await fetchAllHotspots();
    
    return NextResponse.json({
      hotspots,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min cache
      },
    });
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotspots', hotspots: [] },
      { status: 500 }
    );
  }
}
