import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getGhlAccessToken } from '@/lib/ghl/token-helper';

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

  // Use the new token helper to get Mission Metrics GHL tokens
  const ghlIntegration = await getGhlAccessToken(user.id, 'mission_metrics');

  if (!ghlIntegration) {
    return NextResponse.json({ error: 'Mission Metrics GHL integration not found or tokens missing.' }, { status: 404 });
  }

  const { opportunityId, pipelineId, pipelineStageId } = await request.json();
  if (!opportunityId || !pipelineId || !pipelineStageId) {
    return NextResponse.json({ error: 'Opportunity ID, Pipeline ID, and Stage ID are required.' }, { status: 400 });
  }

  try {
    const result = await ghlRequest(
      `https://services.leadconnectorhq.com/opportunities/${opportunityId}`,
      ghlIntegration.access_token,
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
    console.error('Error updating GHL Mission Metrics opportunity stage:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
