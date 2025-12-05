import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getGhlAccessToken } from '@/lib/ghl/token-helper';

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

  // Use the new token helper to get Mission Metrics GHL tokens
  const ghlIntegration = await getGhlAccessToken(user.id, 'mission_metrics');

  if (!ghlIntegration) {
    return NextResponse.json({ error: 'Mission Metrics GHL integration not found or tokens missing.' }, { status: 404 });
  }

  try {
    const baseUrl = 'https://services.leadconnectorhq.com/opportunities/search';
    const url = new URL(baseUrl);
    url.searchParams.append('location_id', ghlIntegration.location_id);

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
        'Authorization': `Bearer ${ghlIntegration.access_token}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GHL Mission Metrics Opportunities API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch opportunities from Mission Metrics GHL.', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const opportunities = data.opportunities || [];
    return NextResponse.json(opportunities);

  } catch (error) {
    console.error('Error fetching GHL Mission Metrics opportunities:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while fetching Mission Metrics opportunities.' }, { status: 500 });
  }
}
