import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getGhlAccessToken } from '@/lib/ghl/token-helper';

export async function GET(
  request: Request,
  props: { params: Promise<{ contactId: string }> }
) {
  const params = await props.params;
  const { contactId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required.' }, { status: 400 });
  }

  // Use the new token helper to get Mission Metrics GHL tokens
  const ghlIntegration = await getGhlAccessToken(user.id, 'mission_metrics');

  if (!ghlIntegration) {
    return NextResponse.json({ error: 'Mission Metrics GHL integration not found or tokens missing.' }, { status: 404 });
  }

  try {
    const url = `https://services.leadconnectorhq.com/contacts/${contactId}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ghlIntegration.access_token}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GHL Mission Metrics Contact API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch contact from Mission Metrics GHL.', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.contact);

  } catch (error) {
    console.error('Error fetching GHL Mission Metrics contact:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while fetching the Mission Metrics contact.' }, { status: 500 });
  }
}
