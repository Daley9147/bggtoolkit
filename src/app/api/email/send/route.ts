import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
      const { to, subject, html } = await request.json();
      const info = await sendEmail(user.id, to, subject, html);
      return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
