import { NextRequest, NextResponse } from 'next/server';
import { fetchStockData, Period } from '@/lib/stocks';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '5d') as Period;
    
    // Validate period
    if (!['1d', '5d', '1mo'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
    }
    
    const stocks = await fetchStockData(period);
    
    return NextResponse.json(stocks, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
