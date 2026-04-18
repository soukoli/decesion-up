import { NextResponse } from 'next/server';
import { fetchSearchTrends } from '@/lib/search-trends';

export const revalidate = 1800;

export async function GET() {
  try {
    const trendsData = await fetchSearchTrends();
    
    return NextResponse.json({
      google: trendsData.google,
      bing: trendsData.bing,
      // Also keep 'trending' for backward compatibility
      trending: trendsData.google,
      period: trendsData.period,
      periodLabel: trendsData.periodLabel,
      lastUpdated: trendsData.lastUpdated,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching search trends:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch search trends', 
        google: [],
        bing: [],
        trending: [],
        period: '1d',
        periodLabel: 'Today',
      },
      { status: 500 }
    );
  }
}
