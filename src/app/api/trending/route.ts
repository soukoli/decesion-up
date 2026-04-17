import { NextResponse } from 'next/server';
import { fetchSearchTrends } from '@/lib/search-trends';

export const revalidate = 1800;

export async function GET() {
  try {
    const trends = await fetchSearchTrends();
    
    return NextResponse.json({
      trends,
      source: 'Google Trends',
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30 min cache
      },
    });
  } catch (error) {
    console.error('Error fetching search trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search trends', trends: [] },
      { status: 500 }
    );
  }
}
