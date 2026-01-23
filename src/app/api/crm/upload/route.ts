import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { data, targetUserId, targetPipelineId, listName } = await request.json();

  if (!data || !Array.isArray(data)) {
    return NextResponse.json({ error: 'Invalid data format.' }, { status: 400 });
  }

  // Determine target user (Admin check required if uploading for someone else)
  let effectiveUserId = user.id;
  if (targetUserId && targetUserId !== user.id) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized to upload for other users.' }, { status: 403 });
      }
      effectiveUserId = targetUserId;
  }

  try {
    let pipelineId = targetPipelineId;

    // 1. Ensure Pipeline Exists (if ID not provided)
    if (!pipelineId) {
        let { data: pipeline } = await supabase
        .from('pipelines')
        .select('id')
        .eq('user_id', effectiveUserId)
        .limit(1)
        .single();

        if (!pipeline) {
        const { data: newPipeline, error: pipeError } = await supabase
            .from('pipelines')
            .insert({ user_id: effectiveUserId, name: 'Sales Pipeline' })
            .select()
            .single();
        if (pipeError) throw pipeError;
        pipeline = newPipeline;

        const stages = ['New Lead', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];
        await supabase.from('stages').insert(
            stages.map((name, i) => ({ pipeline_id: pipeline.id, name, position: i }))
        );
        }
        pipelineId = pipeline.id;
    }

    const { data: stages } = await supabase
      .from('stages')
      .select('id, name')
      .eq('pipeline_id', pipelineId);

    const defaultStageId = stages?.find(s => s.name === 'New Lead')?.id || stages?.[0]?.id;

    // Helper for fuzzy key matching
    const getValue = (row: any, keys: string[]) => {
      for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
            return row[key];
        }
      }
      return null;
    };

    let processedCount = 0;

    for (const row of data) {
      const cleanValue = (val: any) => String(val || '').replace(/[$,]/g, '') || '0';
      
      const email = getValue(row, ['email', 'email address']);
      const identifier = getValue(row, ['identifier', 'charity number', 'ein', 'tax id']);

      // Prepare Contact Object
      const contactData: any = {
          user_id: effectiveUserId, 
          first_name: getValue(row, ['first name', 'firstname', 'first_name']) || '',
          last_name: getValue(row, ['last name', 'lastname', 'last_name']) || '',
          job_title: getValue(row, ['title', 'job title', 'job_title', 'position']),
          email: email,
          // Consolidate 'phone' if generic, but prefer specific fields
          phone: getValue(row, ['phone', 'phone number', 'main phone']), 
          mobile_phone: getValue(row, ['mobile phone', 'mobile']),
          corporate_phone: getValue(row, ['corporate phone', 'company phone', 'work phone']),
          other_phone: getValue(row, ['other phone']),
          website: getValue(row, ['website', 'url', 'web']),
          identifier: identifier,
          organization_name: getValue(row, ['company name', 'company', 'organization']),
          country: getValue(row, ['company country', 'country']) || 'UK',
          num_employees: getValue(row, ['# employees', 'employees', 'number of employees']),
          industry: getValue(row, ['industry', 'sector']),
          keywords: getValue(row, ['keywords', 'tags']),
          person_linkedin_url: getValue(row, ['person linkedin url', 'linkedin', 'linkedin url']),
          company_linkedin_url: getValue(row, ['company linkedin url', 'company linkedin']),
          facebook_url: getValue(row, ['facebook url', 'facebook']),
          twitter_url: getValue(row, ['twitter url', 'twitter']),
          address: getValue(row, ['company address', 'address']),
          city: getValue(row, ['company city', 'city']),
          state: getValue(row, ['company state', 'state']),
          annual_revenue: getValue(row, ['annual revenue', 'revenue']),
          list_name: listName || null
      };

      let contactId = null;

      // Check existing contact by Email OR Identifier
      let existingQuery = supabase.from('contacts').select('id').eq('user_id', effectiveUserId);
      if (identifier) {
          existingQuery = existingQuery.eq('identifier', identifier);
      } else if (email) {
          existingQuery = existingQuery.eq('email', email);
      } else {
          // If no unique identifier, force insert new? Or skip? 
          // Let's rely on name matching? No, dangerous. We'll just insert.
          existingQuery = supabase.from('contacts').select('id').eq('id', '00000000-0000-0000-0000-000000000000'); // Dummy fail
      }

      const { data: existingContact } = await existingQuery.maybeSingle();

      if (existingContact) {
          // Update
          const { error: updateError } = await supabase
              .from('contacts')
              .update(contactData)
              .eq('id', existingContact.id);
          
          if (!updateError) contactId = existingContact.id;
      } else {
          // Insert
          const { data: newContact, error: insertError } = await supabase
              .from('contacts')
              .insert(contactData)
              .select('id')
              .single();
          
          if (!insertError) contactId = newContact.id;
      }

      if (contactId) {
          // Create Opportunity
          const stageName = getValue(row, ['stage', 'status']) || '';
          const stageId = stages?.find(s => s.name.toLowerCase() === stageName.toLowerCase())?.id || defaultStageId;

          await supabase.from('opportunities').insert({
            user_id: effectiveUserId,
            pipeline_id: pipelineId,
            stage_id: stageId,
            contact_id: contactId,
            name: getValue(row, ['company name', 'company']) || `${contactData.first_name} ${contactData.last_name}` || 'New Opportunity',
            value: parseFloat(cleanValue(getValue(row, ['annual revenue', 'revenue', 'value']))) || 0,
            status: 'open'
          });
          processedCount++;
      }
    }

    return NextResponse.json({ success: true, count: processedCount });

  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}