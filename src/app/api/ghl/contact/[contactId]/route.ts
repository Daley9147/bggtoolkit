import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required.' }, { status: 400 });
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
    } catch (error) {
      return NextResponse.json({ error: 'Failed to refresh GHL token.' }, { status: 500 });
    }
  }

  if (!profile.ghl_access_token) {
    return NextResponse.json({ error: 'GHL access token not found.' }, { status: 404 });
  }

  try {
    const url = `https://services.leadconnectorhq.com/contacts/${contactId}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${profile.ghl_access_token}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GHL Contact API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch contact from GHL.', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.contact);

  } catch (error) {
    console.error('Error fetching GHL contact:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while fetching the contact.' }, { status: 500 });
  }
}
