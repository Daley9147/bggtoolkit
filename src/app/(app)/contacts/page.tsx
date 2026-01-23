import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ContactsClient from '@/components/contacts/contacts-client';

export default async function ContactsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <ContactsClient />
    </div>
  );
}
