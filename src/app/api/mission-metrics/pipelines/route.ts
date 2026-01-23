import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  try {
    const { data: pipelines, error } = await supabase
      .from('pipelines')
      .select(`
        id,
        name,
        stages (
          id,
          name,
          position
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pipelines:', error);
      return NextResponse.json({ error: 'Failed to fetch pipelines' }, { status: 500 });
    }

    // Sort stages by position
    const pipelinesWithSortedStages = pipelines?.map(p => ({
      ...p,
      stages: p.stages.sort((a, b) => a.position - b.position)
    })) || [];

    return NextResponse.json(pipelinesWithSortedStages);

  } catch (error) {
    console.error('Unexpected error fetching pipelines:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}