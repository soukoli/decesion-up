import { NextResponse } from 'next/server';
import { fetchAIResearch } from '@/lib/research';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const research = await fetchAIResearch();
    
    return NextResponse.json({
      research,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    });
  } catch (error) {
    console.error('Error fetching research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research', research: [] },
      { status: 500 }
    );
  }
}
