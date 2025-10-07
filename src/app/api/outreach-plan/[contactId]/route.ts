import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const supabase = createClient();

  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required.' }, { status: 400 });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('outreach_templates')
      .select('insights, email, email_subject_lines, linkedin_connection_note, linkedin_follow_up_dm, cold_call_script')
      .eq('ghl_contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'No outreach plan found for this contact.' }, { status: 404 });
    }

    // Map snake_case from DB to camelCase for the frontend
    const formattedData = {
      insights: data.insights,
      email: data.email,
      subjectLines: data.email_subject_lines,
      linkedinConnectionNote: data.linkedin_connection_note,
      linkedinFollowUpDm: data.linkedin_follow_up_dm,
      coldCallScript: data.cold_call_script,
    };

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Error fetching outreach plan:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
