import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { opportunityId, pipelineId, pipelineStageId } = await request.json();
  if (!opportunityId || !pipelineId || !pipelineStageId) {
    return NextResponse.json({ error: 'Opportunity ID, Pipeline ID, and Stage ID are required.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('opportunities')
      .update({ 
        pipeline_id: pipelineId,
        stage_id: pipelineStageId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', opportunityId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating opportunity stage:', error);
      return NextResponse.json({ error: 'Failed to update opportunity stage' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data });

  } catch (error) {
    console.error('Unexpected error updating opportunity stage:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}