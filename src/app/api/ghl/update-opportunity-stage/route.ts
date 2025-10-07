import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

async function ghlRequest(url: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GHL API Error (${response.status}): ${errorData.message || 'Failed to fetch data'}`);
  }
  return response.json();
}

export async function PUT(request: Request) {
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

  const { opportunityId, pipelineId, pipelineStageId } = await request.json();
  if (!opportunityId || !pipelineId || !pipelineStageId) {
    return NextResponse.json({ error: 'Opportunity ID, Pipeline ID, and Stage ID are required.' }, { status: 400 });
  }

  try {
    const result = await ghlRequest(
      `https://services.leadconnectorhq.com/opportunities/${opportunityId}`,
      profile.ghl_access_token,
      {
        method: 'PUT',
        body: JSON.stringify({ 
          pipelineId: pipelineId,
          pipelineStageId: pipelineStageId,
        }),
      }
    );

    return NextResponse.json({ success: true, data: result });

  } catch (error: unknown) {
    console.error('Error updating GHL opportunity stage:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
