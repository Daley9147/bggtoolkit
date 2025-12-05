import { NextRequest, NextResponse } from 'next/server';
import { generateMissionMetricsNonCharityReport } from '@/lib/ai/generate-mission-metrics-non-charity';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  try {
    const { contactId, websiteUrl, specificUrl, userInsight } = await req.json();

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required.' },
        { status: 400 }
      );
    }

    // Generate the report
    const report = await generateMissionMetricsNonCharityReport({
      websiteUrl,
      specificUrl,
      userInsight,
    });

    // Save to Database
    const { error: dbError } = await supabase
      .from('mission_metrics_reports')
      .insert({ // Using insert to avoid potential unique constraint issues for now
        user_id: user.id,
        contact_id: contactId || 'temp_id', // Allow generation without contact link if needed, but schema requires NOT NULL
        website_url: websiteUrl,
        specific_url: specificUrl || null,
        report_json: report,
      });

    if (dbError) {
      console.error("Failed to save report to DB:", dbError);
    }

    return NextResponse.json(report);

  } catch (error: any) {
    console.error('Error generating Non-Charity Mission Metrics report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report.' },
      { status: 500 }
    );
  }
}