import { NextResponse } from 'next/server';
import { fetchAllNews } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const news = await fetchAllNews();
    
    return NextResponse.json({
      news,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', news: [] },
      { status: 500 }
    );
  }
}
