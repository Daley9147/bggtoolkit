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

export async function GET(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  const { contactId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required.' }, { status: 400 });
  }

  // Use the new token helper to get Mission Metrics GHL tokens
  const ghlIntegration = await getGhlAccessToken(user.id, 'mission_metrics');

  if (!ghlIntegration) {
    return NextResponse.json({ error: 'Mission Metrics GHL integration not found or tokens missing.' }, { status: 404 });
  }

  try {
    const notes = await ghlRequest(
      `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
      ghlIntegration.access_token
    );

    return NextResponse.json(notes?.notes || []);

  } catch (error) {
    console.error('Error fetching GHL Mission Metrics notes:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while fetching Mission Metrics notes.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { contactId: string } }
) {
  const { contactId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required.' }, { status: 400 });
  }

  const { body } = await request.json();

  if (!body) {
    return NextResponse.json({ error: 'Note body is required.' }, { status: 400 });
  }

  // Use the new token helper to get Mission Metrics GHL tokens
  const ghlIntegration = await getGhlAccessToken(user.id, 'mission_metrics');

  if (!ghlIntegration) {
    return NextResponse.json({ error: 'Mission Metrics GHL integration not found or tokens missing.' }, { status: 404 });
  }

  try {
    const newNote = await ghlRequest(
      `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
      ghlIntegration.access_token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      }
    );

    return NextResponse.json(newNote);

  } catch (error) {
    console.error('Error adding GHL Mission Metrics note:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while adding the Mission Metrics note.' }, { status: 500 });
  }
}
