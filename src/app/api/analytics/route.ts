import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { refreshGhlToken } from '@/lib/ghl/auth';
import { startOfToday, endOfToday } from 'date-fns';

async function ghlRequest(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28',
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text();
    try {
      const errorData = JSON.parse(text);
      console.error('GHL API Error:', errorData);
    } catch (e) {
      console.error('GHL API Error (not JSON):', text);
    }
    return null;
  }
  return response.json();
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);
  const pipelineId = searchParams.get('pipelineId');

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('ghl_access_token, ghl_refresh_token, ghl_token_expires_at, ghl_location_id, ghl_user_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
  }

  let accessToken = profile.ghl_access_token;
  if (profile.ghl_token_expires_at && new Date(profile.ghl_token_expires_at) < new Date()) {
    if (!profile.ghl_refresh_token) return NextResponse.json({ error: 'GHL refresh token not found.' }, { status: 404 });
    const { accessToken: newAccessToken } = await refreshGhlToken(profile.ghl_refresh_token, user.id, supabase);
    accessToken = newAccessToken;
  }

  if (!accessToken || !profile.ghl_location_id || !profile.ghl_user_id) {
    return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
  }

  const todayStart = startOfToday().toISOString();
  const todayEnd = endOfToday().toISOString();

  let opportunitiesUrl = `https://services.leadconnectorhq.com/opportunities/search?location_id=${profile.ghl_location_id}&limit=100`;
  if (pipelineId) {
    opportunitiesUrl += `&pipeline_id=${pipelineId}`;
  }
  const appointmentsUrl = `https://services.leadconnectorhq.com/calendars/events?locationId=${profile.ghl_location_id}&userId=${profile.ghl_user_id}&startTime=${new Date(todayStart).getTime()}&endTime=${new Date(todayEnd).getTime()}`;
  const pipelinesUrl = `https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${profile.ghl_location_id}`;
  
  const [opportunitiesData, appointmentsData, pipelinesData] = await Promise.all([
    ghlRequest(opportunitiesUrl, accessToken),
    ghlRequest(appointmentsUrl, accessToken),
    ghlRequest(pipelinesUrl, accessToken),
  ]);

  const { count: insightsCompletedToday } = await supabase
    .from('outreach_templates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);

  const { count: emailsSentToday } = await supabase
    .from('logged_actions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action_type', 'email_sent')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);

  const { count: callsLoggedToday } = await supabase
    .from('logged_actions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action_type', 'call_logged')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);

  const opportunities = opportunitiesData?.opportunities || [];
  const pipelines = pipelinesData?.pipelines || [];

  let discoveryStageIds: string[] = [];
  if (pipelineId) {
    const selectedPipeline = pipelines.find((p: any) => p.id === pipelineId);
    const discoveryStage = selectedPipeline?.stages?.find((s: any) => s.name === "Discovery Call Booked");
    if (discoveryStage) {
      discoveryStageIds.push(discoveryStage.id);
    }
  } else {
    discoveryStageIds = pipelines
      .flatMap((p: any) => p.stages)
      .filter((s: any) => s.name === "Discovery Call Booked")
      .map((s: any) => s.id);
  }

  const appointmentsBookedToday = opportunities.filter((opp: any) => {
    const stageChangeDate = new Date(opp.lastStageChangeAt);
    return discoveryStageIds.includes(opp.pipelineStageId) &&
           stageChangeDate >= startOfToday() &&
           stageChangeDate <= endOfToday();
  }).length;
    
  const opportunitiesWon = opportunities.filter((opp: any) => opp.status === 'won').length;

  const recentActivity = opportunities
    .sort((a: any, b: any) => new Date(b.lastStageChangeAt).getTime() - new Date(a.lastStageChangeAt).getTime())
    .slice(0, 5)
    .map((opp: any) => ({
      id: opp.id,
      name: opp.name,
      stageName: pipelines.flatMap((p: any) => p.stages).find((s: any) => s.id === opp.pipelineStageId)?.name || 'Unknown Stage',
      lastStageChangeAt: opp.lastStageChangeAt,
    }));

  const todaysAppointments = appointmentsData?.events?.length || 0;

  return NextResponse.json({
    pipelines: pipelines,
    todaysAppointments,
    insightsCompletedToday,
    emailsSentToday,
    callsLoggedToday,
    appointmentsBookedToday,
    opportunitiesWon,
    recentActivity,
  });
}