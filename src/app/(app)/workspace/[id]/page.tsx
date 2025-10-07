import WorkspaceClient from '@/components/workspace/workspace-client';

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The "new" route is a special case to create a new workspace
  const workspaceId = id === 'new' ? undefined : id;

  return <WorkspaceClient id={workspaceId} />;
}
