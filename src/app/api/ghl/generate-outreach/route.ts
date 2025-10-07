import { NextResponse } from 'next/server';
import { generateOutreachPlan } from '@/lib/ai/generate-outreach-plan';
import { createClient } from '@/lib/supabase/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

export async function POST(request: Request) {
  try {
    const { contactId, homepageUrl, caseStudyUrl } = await request.json();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ghl_access_token, ghl_refresh_token, ghl_token_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
    }

    let accessToken = profile.ghl_access_token;
    if (profile.ghl_token_expires_at && new Date(profile.ghl_token_expires_at) < new Date()) {
      if (!profile.ghl_refresh_token) {
        return NextResponse.json({ error: 'GHL refresh token not found.' }, { status: 404 });
      }
      const { accessToken: newAccessToken } = await refreshGhlToken(profile.ghl_refresh_token, user.id, supabase);
      accessToken = newAccessToken;
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'GHL access token not found.' }, { status: 404 });
    }

    // Fetch contact details from GHL
    const contactUrl = `https://services.leadconnectorhq.com/contacts/${contactId}`;
    const contactResponse = await fetch(contactUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Version': '2021-07-28',
        'Accept': 'application/json',
      },
    });

    if (!contactResponse.ok) {
      throw new Error('Failed to fetch contact details from GHL.');
    }

    const contactData = await contactResponse.json();
    const contactFirstName = contactData.contact.firstName || '';
    const jobTitle = contactData.contact.jobTitle || '';

    const outreachPlan = await generateOutreachPlan({
      url: homepageUrl,
      specificUrl: caseStudyUrl,
      contactFirstName,
      jobTitle,
      ghlContactId: contactId,
    });

    return NextResponse.json(outreachPlan);
  } catch (error: any) {
    console.error('Error in POST /api/ghl/generate-outreach:', error);
    return NextResponse.json({ error: error.message || 'An error occurred.' }, { status: 500 });
  }
}
