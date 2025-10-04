import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

async function ghlRequest(url: string, accessToken: string, options: RequestInit = {}) {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Version', '2021-07-28');
  headers.append('Accept', 'application/json');

  if (options.headers) {
    const customHeaders = new Headers(options.headers);
    for (const [key, value] of customHeaders.entries()) {
      headers.append(key, value);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: headers,
  });

  const responseText = await response.text();
  if (!responseText) {
    return null;
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
        const customFields = await ghlRequest(
          `https://services.leadconnectorhq.com/locations/${profile.ghl_location_id}/customFields`,
          profile.ghl_access_token
        );

        return NextResponse.json(customFields?.customFields || []);

      } catch (error: unknown) {          console.error('Error fetching GHL custom fields:', error);
          const message = error instanceof Error ? error.message : 'An unknown error occurred';
          return NextResponse.json({ error: message }, { status: 500 });
        }
  }
