import { createClient } from '@/lib/supabase/server';
import { getGhlAccessToken } from '@/lib/ghl/token-helper';
import { redirect } from 'next/navigation';
import MissionMetricsClient from '@/components/mission-metrics/mission-metrics-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const REDIRECT_URI = `${origin}/api/oauth/callback`;

    const authUrl = `https://oauth.leadconnectorhq.com/oauth/authorize?response_type=code&client_id=${GHL_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=opportunities.readonly%20opportunities.write%20contacts.readonly%20contacts.write%20conversations.write%20calendars.readonly%20users.readonly%20locations/customFields.readonly%20calendars.write%20calendars/events.readonly%20calendars/events.write%20conversations/message.write&state=mission_metrics`;
    redirect(authUrl);
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Mission Metrics Opportunities</h1>

      {!isConnected ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect to Mission Metrics GoHighLevel</CardTitle>
            <CardDescription>Authorize the BGG Sales Toolkit to access your Mission Metrics GHL account.</CardDescription>
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
