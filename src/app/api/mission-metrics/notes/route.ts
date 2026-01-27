import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get('contactId');
  const opportunityId = searchParams.get('opportunityId');

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  if (!contactId && !opportunityId) {
    return NextResponse.json({ error: 'At least one ID (contact or opportunity) is required.' }, { status: 400 });
  }

  // Construct query
  let query = supabase
    .from('notes')
    .select(`
      id,
      body,
      created_at,
      user_id,
      contact_id,
      opportunity_id
    `)
    .order('created_at', { ascending: false });

  if (contactId && opportunityId) {
    query = query.or(`contact_id.eq.${contactId},opportunity_id.eq.${opportunityId}`);
  } else if (contactId) {
    query = query.eq('contact_id', contactId);
  } else if (opportunityId) {
    query = query.eq('opportunity_id', opportunityId);
  }

  const { data: notes, error } = await query;

  if (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes.' }, { status: 500 });
  }

  // Fetch profiles manually to get author names
  const userIds = Array.from(new Set(notes.map((n: any) => n.user_id)));
  let profilesMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    if (profiles) {
      profiles.forEach((p: any) => {
        profilesMap[p.id] = p.full_name || 'Unknown User';
      });
    }
  }

  const formattedNotes = notes.map((note: any) => ({
    id: note.id,
    body: note.body,
    dateAdded: note.created_at,
    author: profilesMap[note.user_id] || 'Unknown User',
    userId: note.user_id
  }));

  return NextResponse.json(formattedNotes);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { body, contactId, opportunityId } = await request.json();

  if (!body) {
    return NextResponse.json({ error: 'Note body is required.' }, { status: 400 });
  }
  
  if (!contactId && !opportunityId) {
     return NextResponse.json({ error: 'At least one ID (contact or opportunity) is required.' }, { status: 400 });
  }

  try {
    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        contact_id: contactId || null,
        opportunity_id: opportunityId || null,
        body: body,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error);
      return NextResponse.json({ error: 'Failed to add note.' }, { status: 500 });
    }

    // Fetch author profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
        id: newNote.id,
        body: newNote.body,
        dateAdded: newNote.created_at,
        author: profile?.full_name || 'Unknown User',
        userId: newNote.user_id
    });

  } catch (error) {
    console.error('Unexpected error adding note:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}