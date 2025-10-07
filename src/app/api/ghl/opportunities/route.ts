import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);
  const pipelineId = searchParams.get('pipelineId');
  const pipelineStageId = searchParams.get('pipelineStageId');
  const query = searchParams.get('query');

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('ghl_access_token, ghl_refresh_token, ghl_token_expires_at, ghl_location_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
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
    } catch (error) {
      return NextResponse.json({ error: 'Failed to refresh GHL token.' }, { status: 500 });
    }
  }

  if (!profile.ghl_access_token || !profile.ghl_location_id) {
    return NextResponse.json({ error: 'GHL token or location ID not found or user profile not set up.' }, { status: 404 });
  }

  try {
    const baseUrl = 'https://services.leadconnectorhq.com/opportunities/search';
    const url = new URL(baseUrl);
    url.searchParams.append('location_id', profile.ghl_location_id);

    if (query) {
      url.searchParams.append('q', query);
    }
    if (pipelineId && pipelineId !== 'all') {
      url.searchParams.append('pipeline_id', pipelineId);
    }
    if (pipelineStageId && pipelineStageId !== 'all') {
      url.searchParams.append('pipeline_stage_id', pipelineStageId);
    }

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
      console.error('GHL Opportunities API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch opportunities from GHL.', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const opportunities = data.opportunities || [];
    return NextResponse.json(opportunities);

  } catch (error) {
    console.error('Error fetching GHL opportunities:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while fetching opportunities.' }, { status: 500 });
  }
}
