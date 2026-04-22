import { NextResponse } from 'next/server';
import { fetchSchoolArticles } from '@/lib/school-scraper';

// Revalidate every 30 minutes
export const revalidate = 1800;

export async function GET() {
  try {
    const articles = await fetchSchoolArticles();
    
    return NextResponse.json({
      articles,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in school API:', error);
    return NextResponse.json(
      { articles: [], error: 'Failed to fetch school articles' },
      { status: 500 }
    );
  }
}
