import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(
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
    const body = await request.json();
    const { emailBody, followUpBody } = body;

    // Fetch the existing report first to merge changes
    const { data: existingReport, error: fetchError } = await supabase
      .from('mission_metrics_reports')
      .select('report_json')
      .eq('user_id', user.id)
      .eq('contact_id', contactId)
      .single();

    if (fetchError || !existingReport) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    const existingReportJson = existingReport.report_json as any;
    const updatedReportJson = {
      ...existingReportJson,
      emailBody: emailBody !== undefined ? emailBody : existingReportJson.emailBody,
      followUpBody: followUpBody !== undefined ? followUpBody : existingReportJson.followUpBody,
    };

    const { error: updateError } = await supabase
      .from('mission_metrics_reports')
      .update({ report_json: updatedReportJson })
      .eq('user_id', user.id)
      .eq('contact_id', contactId);

    if (updateError) {
      console.error('Error updating Mission Metrics report:', updateError);
      return NextResponse.json({ error: 'Failed to update report.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unexpected error updating Mission Metrics report:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
