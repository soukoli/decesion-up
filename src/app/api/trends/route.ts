import { NextResponse } from 'next/server';
import { fetchAllTrends } from '@/lib/trends';

export const revalidate = 1800;

export async function GET() {
  try {
    const trends = await fetchAllTrends();
    
    return NextResponse.json({
      trends,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends', trends: [] },
      { status: 500 }
    );
  }
}
