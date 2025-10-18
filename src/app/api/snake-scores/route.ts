import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_high_scores');

  if (error) {
    console.error('Error fetching snake scores:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }

  // The RPC returns a flatter structure, so we can adjust the mapping
  const flattenedData = data.map(item => ({
    score: item.max_score,
    fullName: item.full_name || 'Anonymous',
  }));

  return NextResponse.json(flattenedData);
}

export async function POST(request: Request) {
  const { score } = await request.json();

  if (typeof score !== 'number' || score <= 0) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const { error } = await supabase
    .from('snake_scores')
    .insert([{ score, user_id: user.id }]);

  if (error) {
    console.error('Error saving snake score:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
