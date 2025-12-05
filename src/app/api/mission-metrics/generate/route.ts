import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateMissionMetricsReport } from '@/lib/ai/generate-mission-metrics';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { contactId, charityNumber, websiteUrl, specificUrl, userInsight } = await request.json();

  if (!contactId || !charityNumber || !websiteUrl) {
    return NextResponse.json({ error: 'Contact ID, Charity Number, and Website URL are required.' }, { status: 400 });
  }

  try {
    const report = await generateMissionMetricsReport({
      charityNumber,
      websiteUrl,
      specificUrl,
      userInsight,
    });

    const { error: insertError } = await supabase
      .from('mission_metrics_reports')
      .upsert({
        user_id: user.id,
        contact_id: contactId,
        charity_number: charityNumber,
        website_url: websiteUrl,
        specific_url: specificUrl || null,
        report_json: report,
      }, { onConflict: 'user_id, contact_id' }); // Upsert based on user and contact for now
      
    if (insertError) {
      console.error('Error saving Mission Metrics report:', insertError);
      return NextResponse.json({ error: 'Failed to save Mission Metrics report.' }, { status: 500 });
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error generating Mission Metrics report:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while generating the Mission Metrics report.' }, { status: 500 });
  }
}
