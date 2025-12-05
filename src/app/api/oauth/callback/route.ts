import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found.' }, { status: 400 });
  }

  const GHL_CLIENT_ID = process.env.GHL_CLIENT_ID;
  const GHL_CLIENT_SECRET = process.env.GHL_CLIENT_SECRET;
  const origin = new URL(request.url).origin;
  const REDIRECT_URI = `${origin}/api/oauth/callback`;

  const params = new URLSearchParams({
    client_id: GHL_CLIENT_ID || '',
    client_secret: GHL_CLIENT_SECRET || '',
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  });

  try {
    const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GHL Token Exchange Error:', errorData);
      return NextResponse.json({ error: 'Failed to exchange authorization code for token.', details: errorData }, { status: 500 });
    }

    const data = await response.json();

    // Fetch user info from GHL using the userId from the token response
    const userResponse = await fetch(`https://services.leadconnectorhq.com/users/${data.userId}`, {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('GHL Get User Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch user info from GHL.' }, { status: 500 });
    }

    const ghlUser = await userResponse.json();
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    const state = searchParams.get('state');

    // Calculate expires_at timestamp
    const expires_in = data.expires_in; // in seconds
    const expires_at = new Date(Date.now() + expires_in * 1000);

    if (state === 'mission_metrics') {
      const { error: upsertError } = await supabase
        .from('ghl_integrations')
        .upsert({
          user_id: user.id,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          location_id: data.locationId,
          label: 'mission_metrics',
        });

      if (upsertError) {
        console.error('Error upserting mission_metrics GHL integration:', upsertError);
        return NextResponse.json({ error: 'Failed to save Mission Metrics GHL tokens.' }, { status: 500 });
      }

      return NextResponse.redirect(`${origin}/mission-metrics`);

    } else {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ghl_access_token: data.access_token,
          ghl_refresh_token: data.refresh_token,
          ghl_token_expires_at: expires_at.toISOString(),
          ghl_location_id: data.locationId,
          ghl_user_id: data.userId,
          full_name: `${ghlUser.firstName} ${ghlUser.lastName}`,
          ghl_email: ghlUser.email,
        });

      if (upsertError) {
        console.error('Error upserting profile with GHL tokens:', upsertError);
        return NextResponse.json({ error: 'Failed to save GHL tokens to profile.' }, { status: 500 });
      }

      return NextResponse.redirect(origin);
    }


  } catch (error) {
    console.error('Error during token exchange:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
