import { NextResponse } from 'next/server';
import { fetchAllHotspots } from '@/lib/hotspots';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hotspots = await fetchAllHotspots();
    
    return NextResponse.json({
      hotspots,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800', // 15 min cache
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
