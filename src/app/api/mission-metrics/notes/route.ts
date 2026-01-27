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
      opportunity_id,
      author_profile:profiles!notes_user_id_fkey ( full_name )
    `)
    .order('created_at', { ascending: false });

  // If both are provided, we might want notes that match EITHER? 
  // Or match both? 
  // Typically, if I am on an opportunity that is linked to a contact, I want to see:
  // 1. Notes specifically linked to this opportunity.
  // 2. Notes linked to this contact (even if not linked to this opportunity specifically? Maybe).
  
  // The user said: "assigned ... to the opportiuntuy".
  // If I query `.eq('contact_id', contactId).eq('opportunity_id', opportunityId)`, I get intersection.
  // If I want union, Supabase SDK `.or` syntax is needed.
  
  if (contactId && opportunityId) {
    // We want notes that are for this contact OR this opportunity.
    // Syntax: .or(`contact_id.eq.${contactId},opportunity_id.eq.${opportunityId}`)
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

  const formattedNotes = notes.map((note: any) => ({
    id: note.id,
    body: note.body,
    dateAdded: note.created_at,
    author: note.author_profile?.full_name || 'Unknown User',
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
      .select(`
        id,
        body,
        created_at,
        user_id,
        author_profile:profiles!notes_user_id_fkey ( full_name )
      `)
      .single();

    if (error) {
      console.error('Error adding note:', error);
      return NextResponse.json({ error: 'Failed to add note.' }, { status: 500 });
    }

    return NextResponse.json({
        id: newNote.id,
        body: newNote.body,
        dateAdded: newNote.created_at,
        author: newNote.author_profile?.full_name || 'Unknown User',
        userId: newNote.user_id
    });
