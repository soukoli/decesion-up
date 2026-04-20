import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, refreshToken } = await request.json();

    // Determine if this is a refresh or initial auth
    const isRefresh = Boolean(refreshToken);

    const formData = new URLSearchParams();
    
    if (isRefresh) {
      formData.append('refresh_token', refreshToken);
      formData.append('grant_type', 'refresh_token');
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }
      formData.append('username', email);
      formData.append('password', password);
      formData.append('grant_type', 'password');
    }
    
    formData.append('client_id', 'acled');

    const response = await fetch('https://acleddata.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ACLED auth error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Authentication failed. Please check your credentials.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return tokens
    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in, // 86400 seconds = 24 hours
      token_type: data.token_type,
    });
  } catch (error) {
    console.error('ACLED token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
