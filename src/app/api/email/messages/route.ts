import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { fetchEmails } from '@/lib/email-service';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      const { searchParams } = new URL(request.url);
      const folder = searchParams.get('folder') || 'INBOX';
      const messages = await fetchEmails(user.id, folder, 20);
      return NextResponse.json(messages);
  } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
