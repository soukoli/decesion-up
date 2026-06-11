import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLang = 'cs' } = await request.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts array required' }, { status: 400 });
    }

    // Translate each text (sequential to respect rate limits)
    const translations: string[] = [];

    for (const text of texts.slice(0, 20)) { // Max 20 at a time
      if (!text || text.trim().length === 0) {
        translations.push(text);
        continue;
      }

      // Skip if already in target language (simple heuristic)
      const czechChars = /[ěščřžýáíéúůďťňó]/i;
      if (targetLang === 'cs' && czechChars.test(text)) {
        translations.push(text);
        continue;
      }

      try {
        const res = await fetch(
          `${MYMEMORY_API}?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|${targetLang}`,
          { signal: AbortSignal.timeout(5000) }
        );

        if (res.ok) {
          const data = await res.json();
          const translated = data.responseData?.translatedText;
          translations.push(translated && translated !== text ? translated : text);
        } else {
          translations.push(text);
        }
      } catch {
        translations.push(text);
      }
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translate error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
