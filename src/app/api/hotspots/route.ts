import { NextResponse, NextRequest } from 'next/server';
import { fetchAllHotspots } from '@/lib/hotspots';

// ISR - revalidate every 15 minutes for base data
// ACLED data is fetched fresh when token is provided
export const revalidate = 900;

export async function GET(request: NextRequest) {
  try {
    // Get ACLED token from Authorization header if provided
    const authHeader = request.headers.get('Authorization');
    const acledToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    const hotspots = await fetchAllHotspots(acledToken || undefined);
    
    return NextResponse.json({
      hotspots,
      lastUpdated: new Date().toISOString(),
      hasAcledData: !!acledToken,
    }, {
      headers: {
        // Shorter cache when using ACLED token (dynamic data)
        'Cache-Control': acledToken 
          ? 'private, max-age=300' // 5 min for authenticated
          : 'public, s-maxage=900, stale-while-revalidate=1800', // 15 min for public
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
