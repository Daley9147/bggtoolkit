import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const GHL_CLIENT_ID = process.env.GHL_CLIENT_ID;
  const origin = new URL(request.url).origin;
  const REDIRECT_URI = `${origin}/api/oauth/callback`;
  
  const params = new URLSearchParams({
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    client_id: GHL_CLIENT_ID || '',
    scope: [
      'users.readonly',
      'opportunities.readonly',
      'opportunities.write',
      'contacts.readonly',
      'contacts.write',
      'locations/customFields.readonly',
      'calendars.readonly',
      'calendars.write',
      'calendars/events.readonly',
      'calendars/events.write',
      'conversations/message.write',
    ].join(' '),
  });

  const authorizationUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?${params.toString()}`;
  
  return NextResponse.redirect(authorizationUrl);
}
