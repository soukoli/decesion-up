import { NextResponse } from 'next/server';
import { fetchTrendingTopics } from '@/lib/trending';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const trending = await fetchTrendingTopics();
    
    return NextResponse.json({
      trending,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    });
  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending', trending: [] },
      { status: 500 }
    );
  }
}
