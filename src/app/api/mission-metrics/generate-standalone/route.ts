import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateMissionMetricsReport } from '@/lib/ai/generate-mission-metrics';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { identifier, country, websiteUrl, specificUrl, userInsight, contactFirstName } = await request.json();

  if (!country || !websiteUrl) {
    return NextResponse.json({ error: 'Country and Website URL are required.' }, { status: 400 });
  }

  try {
    // 1. Fetch User Details (Profile)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const firstName = contactFirstName || 'there';
    const userFullName = profile?.full_name || 'Mission Metrics Team';

    // 2. Generate Report
    const report = await generateMissionMetricsReport({
      identifier,
      country,
      websiteUrl,
      specificUrl,
      userInsight,
    });

    // 3. Replace Placeholders
    const replacePlaceholders = (text: string) => {
      return text
        .replace(/\[First Name\]/gi, firstName)
        .replace(/\[Your Name\]/gi, userFullName);
    };

    report.emailBody = replacePlaceholders(report.emailBody);
    report.followUpBody = replacePlaceholders(report.followUpBody);

    // Note: We don't save standalone reports to mission_metrics_reports 
    // because that table currently requires a contact_id.

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error generating standalone Mission Metrics report:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while generating the Mission Metrics report.' }, { status: 500 });
  }
}
