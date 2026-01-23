import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is admin (optional, based on requirement "admin need list management")
    // For now, allowing all authenticated users to see lists they have access to.
    // Since RLS is "Users can manage their own contacts", they will only see their own lists.

    const { data, error } = await supabase
      .from('contacts')
      .select('list_name, id')
      .not('list_name', 'is', null);

    if (error) throw error;

    // Group and Count manually or use RPC. 
    // Supabase JS doesn't support "groupBy" and "count" easily in one query without RPC.
    // Fetching all "list_name" might be heavy if millions of rows. 
    // Better approach: create a Postgres function or use raw SQL via RPC if possible.
    // However, for MVP, if data is < 10k, fetching 'list_name' only is fine.
    
    // Let's optimize: use a simple RPC function for aggregation if performance matters.
    // But for now, let's just process the results in memory if the dataset is small.
    // Wait, the prompt implies "admin need list management", which often implies "System Wide".
    // But RLS restricts to "own contacts". 
    // If the user is an Admin, do they see ALL lists?
    // The previous prompt said: "admin need list management... see a list of all lists uploaded".
    // I should check if the user is an admin, and if so, maybe bypass RLS? 
    // Or just rely on the fact that the uploader (Admin) owns the contacts.
    
    // Let's assume the Admin uploaded them, so they own them.

    const listCounts: Record<string, number> = {};
    data.forEach((row: any) => {
        if (row.list_name) {
            listCounts[row.list_name] = (listCounts[row.list_name] || 0) + 1;
        }
    });

    const result = Object.entries(listCounts).map(([name, count]) => ({
        name,
        count
    }));

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('List fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const listName = searchParams.get('name');

    if (!listName) {
        return NextResponse.json({ error: 'List Name required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('list_name', listName);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
