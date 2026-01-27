import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

  try {
    let queryBuilder = supabase
      .from('opportunities')
      .select(`
        id,
        name,
        value,
        status,
        pipeline_id,
        stage_id,
        created_at,
        updated_at,
        pipeline_stage:stages (
          name
        ),
        contact:contacts (
          id,
          first_name,
          last_name,
          email,
          phone,
          organisation_name
        )
      `)
      .eq('user_id', user.id);

    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (pipelineId && pipelineId !== 'all') {
      if (!isUuid(pipelineId)) {
        return NextResponse.json([]);
      }
      queryBuilder = queryBuilder.eq('pipeline_id', pipelineId);
    }
    
    if (pipelineStageId && pipelineStageId !== 'all') {
      if (!isUuid(pipelineStageId)) {
        return NextResponse.json([]);
      }
      queryBuilder = queryBuilder.eq('stage_id', pipelineStageId);
    }

    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    const { data: opportunities, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching opportunities:', error);
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
    }

    // Map to match the shape expected by frontend (GHL style)
    const formattedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      name: opp.name,
      monetaryValue: opp.value,
      pipelineId: opp.pipeline_id,
      pipelineStageId: opp.stage_id,
      pipelineStage: {
        name: (opp.pipeline_stage as any)?.name || 'Unknown'
      },
      contactId: opp.contact?.id,
      lastStageChangeAt: opp.updated_at,
      contact: opp.contact ? {
        id: opp.contact.id,
        name: `${opp.contact.first_name || ''} ${opp.contact.last_name || ''}`.trim(),
        companyName: opp.contact.organisation_name,
        email: opp.contact.email,
        phone: opp.contact.phone,
      } : undefined
    }));

    return NextResponse.json(formattedOpportunities);

  } catch (error) {
    console.error('Unexpected error fetching opportunities:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}