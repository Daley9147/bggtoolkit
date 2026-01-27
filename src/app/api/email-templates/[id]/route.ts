import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const templateId = params.id;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { template_name, subject_line, body } = await request.json();

  if (!template_name || !subject_line || !body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('email_templates')
    .update({
      template_name,
      subject_line,
      body,
    })
    .eq('id', templateId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const templateId = params.id;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Template deleted successfully' });
}
