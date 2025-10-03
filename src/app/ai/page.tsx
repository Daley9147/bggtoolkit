import Header from '@/components/layout/header';
import AiClient from '@/components/ai/ai-client';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AiPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <AiClient />
      </main>
    </div>
  );
}
