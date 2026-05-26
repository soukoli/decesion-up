import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    // Save Google tokens to user_profile for Drive backup
    if (data.session?.user?.id) {
      const providerToken = data.session.provider_token;
      const refreshToken = data.session.provider_refresh_token;
      
      console.log('Auth callback - provider_token exists:', !!providerToken, 'refresh_token exists:', !!refreshToken);

      const { error: upsertError } = await supabase.from('user_profile').upsert({
        id: data.session.user.id,
        font_size: 'md',
        language: 'cs',
        theme: 'dark',
        google_token: providerToken || null,
        google_refresh_token: refreshToken || null,
      }, { onConflict: 'id' });
      
      if (upsertError) {
        console.error('Failed to save Google token:', upsertError);
      } else {
        console.log('Google token saved to DB for user:', data.session.user.id);
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
