import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ghl_access_token: null,
      ghl_refresh_token: null,
      ghl_token_expires_at: null,
      ghl_location_id: null,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error disconnecting GHL:', error);
    return NextResponse.json({ error: 'Failed to disconnect GHL.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
