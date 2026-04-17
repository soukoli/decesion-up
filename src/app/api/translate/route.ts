import { NextRequest, NextResponse } from 'next/server';

interface TranslationResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails: string;
}

interface TranslateRequestBody {
  texts: string[];
  sourceLang?: string;
  targetLang?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequestBody = await request.json();
    const { texts, sourceLang = 'en', targetLang = 'cs' } = body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: 'Texts array is required' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const textsToTranslate = texts.slice(0, 20);
    const results: string[] = [];

    for (const text of textsToTranslate) {
      if (!text || text.trim().length === 0) {
        results.push('');
        continue;
      }

      // Truncate long texts (MyMemory limit is 500 bytes)
      const truncatedText = text.length > 450 ? text.substring(0, 447) + '...' : text;

      try {
        const url = new URL('https://api.mymemory.translated.net/get');
        url.searchParams.set('q', truncatedText);
        url.searchParams.set('langpair', `${sourceLang}|${targetLang}`);

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          console.error(`Translation API error: ${response.status}`);
          results.push(text); // Return original on error
          continue;
        }

        const data: TranslationResponse = await response.json();

        if (data.responseStatus === 200) {
          results.push(data.responseData.translatedText);
        } else {
          console.error(`Translation failed: ${data.responseDetails}`);
          results.push(text); // Return original on error
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch {
        results.push(text); // Return original on error
      }
    }

    return NextResponse.json({
      translations: results,
      targetLang,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
