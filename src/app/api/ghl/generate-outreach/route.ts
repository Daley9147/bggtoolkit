import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { POST as generateTalkingPoints } from '@/app/api/talking-points/route';
import { refreshGhlToken } from '@/lib/ghl/auth';

// Helper function to call GHL API
async function ghlRequest(url: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Version': '2021-07-28',
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GHL API Error (${response.status}): ${errorData.message || 'Failed to fetch data'}`);
  }
  return response.json();
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('ghl_access_token, ghl_refresh_token, ghl_token_expires_at, ghl_location_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching GHL token from profile:', profileError);
    return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
  }

  if (profile.ghl_token_expires_at && new Date(profile.ghl_token_expires_at) < new Date()) {
    if (!profile.ghl_refresh_token) {
      return NextResponse.json({ error: 'GHL refresh token not found.' }, { status: 404 });
    }
    try {
      const { accessToken, locationId } = await refreshGhlToken(profile.ghl_refresh_token, user.id, supabase);
      profile.ghl_access_token = accessToken;
      profile.ghl_location_id = locationId;
    } catch {
      return NextResponse.json({ error: 'Failed to refresh GHL token.' }, { status: 500 });
    }
  }

  if (!profile.ghl_access_token || !profile.ghl_location_id) {
    return NextResponse.json({ error: 'GHL credentials not found.' }, { status: 404 });
  }

  const { contactId, homepageUrl, caseStudyUrl } = await request.json();
  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required.' }, { status: 400 });
  }

  try {
    // 1. Fetch contact details from GHL to get name and title
    const contact = await ghlRequest(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      profile.ghl_access_token
    );

    let companyWebsite = homepageUrl;
    // 2. If homepageUrl is not provided, find the website from GHL contact details
    if (!companyWebsite) {
      companyWebsite = contact.website;
      if (!companyWebsite) {
        const websiteField = contact.customFields?.find((field: CustomField) => field.name?.toLowerCase() === 'website');
        if (websiteField) {
          companyWebsite = websiteField.value;
        }
      }
    }

    if (!companyWebsite) {
      return NextResponse.json({ error: 'Company website not found for this contact and was not provided manually.' }, { status: 404 });
    }

    // 3. Call our internal talking-points API to generate the plan
    const talkingPointsRequest = new Request(new URL(request.url).origin + '/api/talking-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: companyWebsite,
            specificUrl: caseStudyUrl,
            contactFirstName: contact.contact.firstName,
            jobTitle: contact.contact.title, 
        }),
    });
    
    const talkingPointsResponse = await generateTalkingPoints(talkingPointsRequest);
    
    if (!talkingPointsResponse.ok) {
        const errorData = await talkingPointsResponse.json();
        return NextResponse.json({ error: 'Failed to generate talking points.', details: errorData }, { status: talkingPointsResponse.status });
    }

    const outreachPlan = await talkingPointsResponse.json();

    // 4. Return the generated plan
    return NextResponse.json(outreachPlan);

  } catch (error: unknown) {
    console.error('Error generating outreach plan:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface CustomField {
  name?: string;
  value?: string;
}
