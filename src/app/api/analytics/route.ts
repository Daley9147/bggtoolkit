import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { startOfToday, endOfToday } from 'date-fns';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);
  const pipelineId = searchParams.get('pipelineId');

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const todayStart = startOfToday().toISOString();
  const todayEnd = endOfToday().toISOString();

  // 1. Fetch Pipelines
  const { data: pipelines } = await supabase
    .from('pipelines')
    .select('id, name')
    .eq('user_id', user.id);

  // 2. Fetch Emails Sent Today
  const { count: emailsSentToday } = await supabase
    .from('logged_actions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action', 'email_sent')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);

  // 3. Fetch Calls Logged Today
  const { count: callsLoggedToday } = await supabase
    .from('logged_actions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action', 'call_logged')
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd);

  // 4. Fetch Task Stats
  const { count: highPriorityTasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('priority', 'High')
    .neq('status', 'Completed');

  const { count: mediumPriorityTasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('priority', 'Medium')
    .neq('status', 'Completed');

  const { count: lowPriorityTasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('priority', 'Low')
    .neq('status', 'Completed');

  const { data: highPriorityTasks } = await supabase
    .from('tasks')
    .select('title')
    .eq('user_id', user.id)
    .eq('priority', 'High')
    .neq('status', 'Completed')
    .order('created_at', { ascending: true })
    .limit(4);

  // 5. Fetch Opportunities Data
  let query = supabase
    .from('opportunities')
    .select(`
      id,
      name,
      status,
      updated_at,
      stages (
        id,
        name
      )
    `)
    .eq('user_id', user.id);

  if (pipelineId && pipelineId !== 'all') {
    query = query.eq('pipeline_id', pipelineId);
  }

  const { data: opportunities } = await query;

  const opportunitiesWon = opportunities?.filter((opp) => opp.status === 'won').length || 0;

  // "Discovery Call Booked" logic - approximate by finding stage name
  const appointmentsBookedToday = opportunities?.filter((opp: any) => {
    const stageName = opp.stages?.name || '';
    const updated = new Date(opp.updated_at);
    return stageName.toLowerCase().includes('discovery') && 
           updated >= startOfToday() && 
           updated <= endOfToday();
  }).length || 0;


  const recentActivity = opportunities
    ? opportunities
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)
        .map((opp: any) => ({
          id: opp.id,
          name: opp.name,
          stageName: opp.stages?.name || 'Unknown Stage',
          lastStageChangeAt: opp.updated_at,
        }))
    : [];

  return NextResponse.json({
    pipelines: pipelines || [],
    todaysAppointments: 0, // Placeholder
    insightsCompletedToday: 0, // Placeholder
    emailsSentToday: emailsSentToday || 0,
    callsLoggedToday: callsLoggedToday || 0,
    appointmentsBookedToday,
    opportunitiesWon,
    recentActivity,
    highPriorityTasksCount: highPriorityTasksCount || 0,
    mediumPriorityTasksCount: mediumPriorityTasksCount || 0,
    lowPriorityTasksCount: lowPriorityTasksCount || 0,
    highPriorityTasks: highPriorityTasks || [],
  });
}