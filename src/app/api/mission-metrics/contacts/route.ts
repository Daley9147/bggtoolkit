import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  try {
    let queryBuilder = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,organisation_name.ilike.%${query}%`);
    }

    const { data: contacts, error } = await queryBuilder;

    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    // Fetch profiles to map user_id to names
    const userIds = Array.from(new Set(contacts.map(c => c.user_id)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const contactsWithAssignee = contacts.map(contact => ({
      ...contact,
      assignee: profileMap.get(contact.user_id) || null
    }));

    return NextResponse.json(contactsWithAssignee);

  } catch (error) {
    console.error('Unexpected error fetching contacts:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
