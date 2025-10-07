'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import '@excalidraw/excalidraw/index.css';

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

interface WorkspaceData {
  id?: string;
  title: string;
  data: any;
}

export default function WorkspaceClient({ id }: { id?: string }) {
  const [title, setTitle] = useState('Untitled Workspace');
  const [initialScene, setInitialScene] = useState<any>(null); // only for first load
  const [isSaving, setIsSaving] = useState(false);
  const sceneRef = useRef<any>(null); // ← holds latest scene data without causing re-renders

  const { toast } = useToast();
  const router = useRouter();

  // Load workspace data once
  useEffect(() => {
    if (!id) {
      // For new workspaces, start with a minimal scene
      setInitialScene({ elements: [], appState: { collaborators: [] } });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${id}`);
        if (!res.ok) throw new Error('Failed to fetch workspace');
        const data: WorkspaceData = await res.json();
        setTitle(data.title);
        // Ensure collaborators is always an array
        const sceneData = data.data || {};
        sceneData.appState = { ...sceneData.appState, collaborators: [] };
        setInitialScene(sceneData);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Could not load workspace.',
          variant: 'destructive',
        });
      }
    })();
  }, [id, toast]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload: WorkspaceData = { title, data: sceneRef.current };
      const res = await fetch(`/api/workspaces/${id || ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      toast({ title: 'Saved', description: 'Workspace saved successfully.' });
      if (!id) router.push(`/workspace/${saved.id}`);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to save workspace.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [id, title, isSaving, router, toast]);

  return (
    <div className="h-[calc(100vh-10rem)] w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Link href="/workspace">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Input
            className="w-64"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Excalidraw Canvas */}
      <div className="flex-grow">
        {(initialScene !== null || !id) && ( // Render immediately for new workspaces
          <Excalidraw
            initialData={initialScene}
            onChange={(elements, appState, files) => {
              sceneRef.current = { elements, appState, files };
            }}
            theme="light"
            viewModeEnabled={false} // Explicitly enable editing tools
          />
        )}
      </div>
    </div>
  );
}
