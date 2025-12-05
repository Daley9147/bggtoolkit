import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getGhlAccessToken } from '@/lib/ghl/token-helper';

async function ghlRequest(url: string, accessToken: string, options: RequestInit = {}) {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Version', '2021-07-28');
  headers.append('Accept', 'application/json');

  if (options.headers) {
    const customHeaders = new Headers(options.headers);
    for (const [key, value] of customHeaders.entries()) {
      headers.append(key, value);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: headers,
  });

  const responseText = await response.text();
  if (!responseText) {
    return null;
  }
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse GHL response:", responseText);
    throw new Error("Invalid JSON response from GHL API");
  }
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  // Use the new token helper to get Mission Metrics GHL tokens
  const ghlIntegration = await getGhlAccessToken(user.id, 'mission_metrics');

  if (!ghlIntegration) {
    return NextResponse.json({ error: 'Mission Metrics GHL integration not found or tokens missing.' }, { status: 404 });
  }
  
  try {
    const customFields = await ghlRequest(
      `https://services.leadconnectorhq.com/locations/${ghlIntegration.location_id}/customFields`,
      ghlIntegration.access_token
    );

    return NextResponse.json(customFields?.customFields || []);

  } catch (error: unknown) {          console.error('Error fetching GHL Mission Metrics custom fields:', error);
          const message = error instanceof Error ? error.message : 'An unknown error occurred';
          return NextResponse.json({ error: message }, { status: 500 });
        }
}
