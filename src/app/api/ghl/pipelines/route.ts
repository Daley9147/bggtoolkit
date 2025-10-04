import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

async function ghlRequest(url: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28',
      'Accept': 'application/json',
      ...options.headers,
    },
  });
  const responseText = await response.text();
  if (!responseText) {
    return null; // Or handle as an error, depending on expected API behavior
  }
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse GHL response:", responseText);
    throw new Error("Invalid JSON response from GHL API");
  }
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('ghl_access_token, ghl_refresh_token, ghl_token_expires_at, ghl_location_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching GHL token from profile:', profileError);
    return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
  }

  if (profile.ghl_token_expires_at && new Date(profile.ghl_token_expires_at) < new Date()) {
    if (!profile.ghl_refresh_token) {
      return NextResponse.json({ error: 'GHL refresh token not found.' }, { status: 404 });
    }
    try {
      const { accessToken, locationId } = await refreshGhlToken(profile.ghl_refresh_token, user.id, supabase);
      profile.ghl_access_token = accessToken;
      profile.ghl_location_id = locationId;
    } catch {
      return NextResponse.json({ error: 'Failed to refresh GHL token.' }, { status: 500 });
    }
  }

      if (!profile.ghl_access_token || !profile.ghl_location_id) {
        return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
      }

      try {
        const pipelines = await ghlRequest(
          `https://services.leadconnectorhq.com/opportunities/pipelines/?locationId=${profile.ghl_location_id}`,
          profile.ghl_access_token
        );

        return NextResponse.json(pipelines?.pipelines || []);

      } catch (error: unknown) {
        console.error('Error fetching GHL pipelines:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
      }
}
