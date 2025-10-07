import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

async function ghlRequest(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28',
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('GHL API Error:', errorData);
    throw new Error(`Failed to fetch from GHL: ${errorData.message || response.statusText}`);
  }
  return response.json();
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get('calendarId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  if (!calendarId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('ghl_access_token, ghl_refresh_token, ghl_token_expires_at, ghl_location_id, ghl_user_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
  }

  let accessToken = profile.ghl_access_token;
  if (profile.ghl_token_expires_at && new Date(profile.ghl_token_expires_at) < new Date()) {
    if (!profile.ghl_refresh_token) {
      return NextResponse.json({ error: 'GHL refresh token not found.' }, { status: 404 });
    }
    try {
      const { accessToken: newAccessToken } = await refreshGhlToken(profile.ghl_refresh_token, user.id, supabase);
      accessToken = newAccessToken;
    } catch (error) {
      return NextResponse.json({ error: 'Failed to refresh GHL token.' }, { status: 500 });
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'GHL access token not found.' }, { status: 404 });
  }

  try {
    const eventsUrl = new URL('https://services.leadconnectorhq.com/calendars/events');
    eventsUrl.searchParams.append('locationId', profile.ghl_location_id!);
    eventsUrl.searchParams.append('userId', profile.ghl_user_id!);
    eventsUrl.searchParams.append('startTime', new Date(startDate).getTime().toString());
    eventsUrl.searchParams.append('endTime', new Date(endDate).getTime().toString());

    const data = await ghlRequest(eventsUrl.toString(), accessToken);
    const appointments = data.events;

    // Fetch contact details for each appointment
    const enrichedAppointments = await Promise.all(
      appointments.map(async (appt: any) => {
        if (appt.contactId) {
          try {
            const contactData = await ghlRequest(
              `https://services.leadconnectorhq.com/contacts/${appt.contactId}`,
              accessToken
            );
            return {
              ...appt,
              contact: contactData.contact,
            };
          } catch (error) {
            console.error(`Failed to fetch contact ${appt.contactId}:`, error);
            return { ...appt, contact: { name: 'Unknown Contact' } };
          }
        }
        return appt;
      })
    );

    return NextResponse.json(enrichedAppointments);

  } catch (error) {
    console.error('Error fetching GHL appointments:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
