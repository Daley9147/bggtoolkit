import { createClient } from '@/lib/supabase/server';
import { getGhlAccessToken } from '@/lib/ghl/token-helper';
import { redirect } from 'next/navigation';
import MissionMetricsClient from '@/components/mission-metrics/mission-metrics-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { headers } from 'next/headers';

const GHL_CLIENT_ID = process.env.GHL_CLIENT_ID;

export default async function MissionMetricsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const ghlIntegration = await getGhlAccessToken(user.id, 'mission_metrics');
  const isConnected = !!ghlIntegration;

  const connectGhl = async () => {
    'use server';
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https');
    const origin = `${protocol}://${host}`;
    const REDIRECT_URI = `${origin}/api/oauth/callback`;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: GHL_CLIENT_ID || '',
      redirect_uri: REDIRECT_URI,
      scope: [
        'opportunities.readonly',
        'opportunities.write',
        'contacts.readonly',
        'contacts.write',
        'conversations.write',
        'calendars.readonly',
        'users.readonly',
        'locations/customFields.readonly',
        'calendars.write',
        'calendars/events.readonly',
        'calendars/events.write',
        'conversations/message.write',
      ].join(' '),
      state: 'mission_metrics',
    });

    // Using the official LeadConnector Marketplace endpoint
    const authUrl = `https://marketplace.leadconnectorhq.com/oauth/chooselocation?${params.toString()}`;
    redirect(authUrl);
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Mission Metrics Opportunities</h1>

      {!isConnected ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect to Mission Metrics GoHighLevel</CardTitle>
            <CardDescription>Authorize the Sales Toolkit to access your Mission Metrics GHL account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={connectGhl}>
              <Button type="submit" className="w-full">Connect GoHighLevel</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <MissionMetricsClient />
      )}
    </div>
  );
}
