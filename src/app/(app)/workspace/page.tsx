import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function WorkspacesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let workspaces: { id: string; title: string; updated_at: string }[] = [];
  if (user) {
    const { data } = await supabase
      .from('workspaces')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    workspaces = data || [];
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workspace</h1>
        <Button asChild>
          <Link href="/workspace/new">
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader>
              <CardTitle>{workspace.title || 'Untitled Workspace'}</CardTitle>
              <CardDescription>
                Last updated {formatDistanceToNow(new Date(workspace.updated_at), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/workspace/${workspace.id}`}>Open</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {workspaces.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You don't have any saved workspaces yet.</p>
          <Button asChild className="mt-4">
            <Link href="/workspace/new">Create your first one</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
