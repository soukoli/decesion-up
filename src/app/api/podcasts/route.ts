import { NextResponse } from 'next/server';
import { fetchAllPodcasts } from '@/lib/rss';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const podcasts = await fetchAllPodcasts();
    
    return NextResponse.json({
      podcasts,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcasts', podcasts: [] },
      { status: 500 }
    );
  }
}
