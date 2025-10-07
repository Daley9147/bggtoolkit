import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { contactId, note } = await request.json();

  if (!contactId || !note) {
    return NextResponse.json({ error: 'Missing contactId or note body.' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('ghl_access_token, ghl_refresh_token, ghl_token_expires_at')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
  }

  let accessToken = profile.ghl_access_token;
  if (profile.ghl_token_expires_at && new Date(profile.ghl_token_expires_at) < new Date()) {
    if (!profile.ghl_refresh_token) {
      return NextResponse.json({ error: 'GHL refresh token not found.' }, { status: 404 });
    }
    const { accessToken: newAccessToken } = await refreshGhlToken(profile.ghl_refresh_token, user.id, supabase);
    accessToken = newAccessToken;
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'GHL access token not found.' }, { status: 404 });
  }

  try {
    // Add the note to GHL
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ body: note }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add note to GHL');
    }

    // Log the action in our database
    await supabase.from('logged_actions').insert({
      user_id: user.id,
      contact_id: contactId,
      action_type: 'call_logged',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
