import { NextResponse } from 'next/server';
import { fetchAllCzechNews } from '@/lib/czech-news';

// ISR - revalidate every 20 minutes (more frequent for local news)
export const revalidate = 1200;

export async function GET() {
  try {
    const czechNews = await fetchAllCzechNews();
    
    return NextResponse.json({
      news: czechNews,
      lastUpdated: new Date().toISOString(),
      country: 'CZ',
      totalSources: 5,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=2400',
      },
    });
  } catch (error) {
    console.error('Error fetching Czech news:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Czech news', 
        news: [],
        country: 'CZ',
        totalSources: 0,
      },
      { status: 500 }
    );
  }
}