import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  props: { params: Promise<{ contactId: string }> }
) {
  const params = await props.params;
  const { contactId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('mission_metrics_reports')
      .select('report_json, charity_number, website_url, specific_url')
      .eq('user_id', user.id)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
      console.error('Error fetching Mission Metrics report:', error);
      return NextResponse.json({ error: 'Failed to fetch report.' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(null); // No report found
    }

    // Return the report JSON along with metadata to pre-fill the form
    return NextResponse.json({
      report: data.report_json,
      metadata: {
        charityNumber: data.charity_number,
        websiteUrl: data.website_url,
        specificUrl: data.specific_url,
      }
    });

  } catch (error) {
    console.error('Unexpected error fetching Mission Metrics report:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
