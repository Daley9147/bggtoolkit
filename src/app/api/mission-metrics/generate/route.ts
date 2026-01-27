import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateMissionMetricsReport } from '@/lib/ai/generate-mission-metrics';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { contactId, identifier, country, websiteUrl, specificUrl, userInsight } = await request.json();

  if (!contactId || !country || !websiteUrl) {
    return NextResponse.json({ error: 'Contact ID, Country, and Website URL are required.' }, { status: 400 });
  }

  try {
    // 1. Fetch Contact Details
    const { data: contact } = await supabase
      .from('contacts')
      .select('first_name')
      .eq('id', contactId)
      .single();

    // 2. Fetch User Details (Profile)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const contactFirstName = contact?.first_name || 'there';
    const userFullName = profile?.full_name || 'Mission Metrics Team';

    // 3. Generate Report
    const report = await generateMissionMetricsReport({
      identifier,
      country,
      websiteUrl,
      specificUrl,
      userInsight,
    });

    // 4. Replace Placeholders
    const replacePlaceholders = (text: string) => {
      return text
        .replace(/\[First Name\]/gi, contactFirstName)
        .replace(/\[Your Name\]/gi, userFullName);
    };

    report.emailBody = replacePlaceholders(report.emailBody);
    report.followUpBody = replacePlaceholders(report.followUpBody);

    // 5. Save Report
    const { error: insertError } = await supabase
      .from('mission_metrics_reports')
      .upsert({
        user_id: user.id,
        contact_id: contactId,
        charity_number: identifier, // storing identifier in charity_number column
        website_url: websiteUrl,
        specific_url: specificUrl || null,
        report_json: report as any,
      }, { onConflict: 'user_id, contact_id' }); 
      
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