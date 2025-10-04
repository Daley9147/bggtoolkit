import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('ghl_access_token, ghl_refresh_token, ghl_token_expires_at, ghl_location_id, ghl_user_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching GHL token from profile:', profileError);
    return NextResponse.json({ error: 'GHL token or location ID not found or user profile not set up.' }, { status: 404 });
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

  if (!profile.ghl_access_token || !profile.ghl_location_id || !profile.ghl_user_id) {
    return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
  }

  try {
    // 1. Fetch all calendars in the location
    const url = new URL('https://services.leadconnectorhq.com/calendars/');
    url.searchParams.append('locationId', profile.ghl_location_id);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${profile.ghl_access_token}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GHL Calendars API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch calendars from GHL.', details: errorData }, { status: response.status });
    }

    const { calendars }: { calendars: Calendar[] } = await response.json();

    // 2. Filter calendars by the user's GHL ID
    const userCalendars = calendars.filter((calendar: Calendar) => 
      calendar.teamMembers.some((member: { userId: string }) => member.userId === profile.ghl_user_id)
    );

    return NextResponse.json(userCalendars);

  } catch (error: unknown) {
    console.error('Error fetching GHL calendars:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface Calendar {
  teamMembers: { userId: string }[];
}
