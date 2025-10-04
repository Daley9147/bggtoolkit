import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { contactId, body } = await request.json();

  if (!contactId || !body) {
    return NextResponse.json({ error: 'Missing contactId or email body.' }, { status: 400 });
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
    const response = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.ghl_access_token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        type: 'Email',
        contactId: contactId,
        html: body,
        subject: 'Following Up', // You might want to make this dynamic
        locationId: profile.ghl_location_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GHL Send Email API Error:', errorData);
      return NextResponse.json({ error: 'Failed to send email via GHL.', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('Error sending email via GHL:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
