import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StaffClient from '@/components/staff/staff-client';

export default async function StaffPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify Admin Access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isEmailAdmin = user.email === 'darrel@missionmetrics.io';
  const isDbAdmin = profile?.role === 'admin';

  if (!isEmailAdmin && !isDbAdmin) {
    redirect('/'); 
  }

  return <StaffClient />;
}
