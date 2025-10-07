import { NextResponse } from 'next/server';
import { generateOutreachPlan } from '@/lib/ai/generate-outreach-plan';

export async function POST(req: Request) {
  try {
    const { url, specificUrl, contactFirstName, jobTitle, ghlContactId } = await req.json();
    
    const outreachPlan = await generateOutreachPlan({
      url,
      specificUrl,
      contactFirstName,
      jobTitle,
      ghlContactId,
    });

    return NextResponse.json(outreachPlan);
  } catch (error: any) {
    console.error('Error in POST /api/talking-points:', error);
    return new Response(JSON.stringify({ message: error.message || 'An error occurred.' }), { status: 500 });
  }
}
