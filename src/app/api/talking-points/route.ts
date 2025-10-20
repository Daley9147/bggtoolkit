import { NextResponse } from 'next/server';
import { generateOutreachPlan } from '@/lib/ai/generate-outreach-plan';

export async function POST(req: Request) {
  try {
    const { url, specificUrl, contactFirstName, jobTitle, ghlContactId, organizationType, nonProfitIdentifier } = await req.json();
    
    const { insights, email, subjectLines, linkedinConnectionNote, linkedinFollowUpDm, coldCallScript, followUpEmailSubjectLines, followUpEmailBody } = await generateOutreachPlan({
      url,
      specificUrl,
      contactFirstName,
      jobTitle,
      ghlContactId,
      organizationType,
      nonProfitIdentifier,
    });

    return NextResponse.json({ insights, email, subjectLines, linkedinConnectionNote, linkedinFollowUpDm, coldCallScript, followUpEmailSubjectLines, followUpEmailBody });
  } catch (error: any) {
    console.error('Error in POST /api/talking-points:', error);
    return new Response(JSON.stringify({ message: error.message || 'An error occurred.' }), { status: 500 });
  }
}
