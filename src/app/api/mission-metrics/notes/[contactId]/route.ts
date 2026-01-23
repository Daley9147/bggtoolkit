import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  props: { params: Promise<{ contactId: string }> }
) {
  const params = await props.params;
  const { contactId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  if (!contactId) {
    return NextResponse.json({ error: 'Contact ID is required.' }, { status: 400 });
  }

  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('contact_id', contactId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json({ error: 'Failed to fetch notes.' }, { status: 500 });
    }

    const formattedNotes = notes.map(note => ({
      id: note.id,
      body: note.body,
      dateAdded: note.created_at,
    }));

    return NextResponse.json(formattedNotes);

  } catch (error) {
    console.error('Unexpected error fetching notes:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ contactId: string }> }
) {
  const params = await props.params;
  const { contactId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }

  const { body } = await request.json();

  if (!body) {
    return NextResponse.json({ error: 'Note body is required.' }, { status: 400 });
  }

  try {
    const { data: newNote, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        contact_id: contactId,
        body: body,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error);
      return NextResponse.json({ error: 'Failed to add note.' }, { status: 500 });
    }

    return NextResponse.json({
        id: newNote.id,
        body: newNote.body,
        dateAdded: newNote.created_at
    });

  } catch (error) {
    console.error('Unexpected error adding note:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}