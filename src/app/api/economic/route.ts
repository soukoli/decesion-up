import { NextResponse } from 'next/server';
import { fetchAllEconomicData } from '@/lib/economic';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const economic = await fetchAllEconomicData();
    
    return NextResponse.json({
      economic,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error fetching economic data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch economic data', economic: [] },
      { status: 500 }
    );
  }
}
