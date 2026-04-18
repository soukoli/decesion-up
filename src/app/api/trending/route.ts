import { NextResponse } from 'next/server';
import { fetchSearchTrends } from '@/lib/search-trends';

export const revalidate = 1800;

export async function GET() {
  try {
    const trendsData = await fetchSearchTrends();
    
    return NextResponse.json({
      global: trendsData.global,
      czech: trendsData.czech,
      // Legacy compatibility
      google: trendsData.global,
      bing: trendsData.czech,
      trending: trendsData.global,
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
        global: [],
        czech: [],
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
