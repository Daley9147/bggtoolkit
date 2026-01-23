import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MissionMetricsClient from '@/components/mission-metrics/mission-metrics-client';

export default async function OpportunitiesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 h-[calc(100vh-4rem)]">
      <MissionMetricsClient />
    </div>
  );
}
