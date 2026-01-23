'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil, ArrowLeft, Save } from 'lucide-react';
import CsvUploader from '@/components/crm/csv-uploader';

interface Stage {
    id: string;
    name: string;
    position: number;
}

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

export default function StaffPipelinesDialog({ userId, userName, isOpen, onOpenChange }: { userId: string, userName: string, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [tempStages, setTempStages] = useState<Stage[]>([]);
  
  const supabase = createClient();
  const { toast } = useToast();

  const fetchPipelines = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('pipelines')
      .select('*, stages(*)')
      .eq('user_id', userId)
      .order('created_at');

    if (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load pipelines.', variant: 'destructive' });
    } else {
      // Sort stages
      const sorted = data.map((p: any) => ({
        ...p,
        stages: p.stages.sort((a: any, b: any) => a.position - b.position)
      }));
      setPipelines(sorted);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchPipelines();
      setEditingPipeline(null);
    }
  }, [isOpen, userId]);

  const handleCreatePipeline = async () => {
    if (!newPipelineName.trim()) return;
    
    // Create Pipeline
    const { data: pipe, error } = await supabase
      .from('pipelines')
      .insert({ user_id: userId, name: newPipelineName })
      .select()
      .single();

    if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
    }

    // Create Default Stages
    const stages = ['New Lead', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    await supabase.from('stages').insert(
        stages.map((name, i) => ({ pipeline_id: pipe.id, name, position: i }))
    );

    setNewPipelineName('');
    toast({ title: 'Success', description: 'Pipeline created.' });
    fetchPipelines();
  };

  const handleDeletePipeline = async (id: string) => {
      if (!confirm('Are you sure? This will delete all opportunities in this pipeline.')) return;
      
      const { error } = await supabase.from('pipelines').delete().eq('id', id);
      if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
          setPipelines(pipelines.filter(p => p.id !== id));
          toast({ title: 'Success', description: 'Pipeline deleted.' });
      }
  }

  const handleEditClick = (pipeline: Pipeline) => {
      setEditingPipeline(pipeline);
      setTempStages(JSON.parse(JSON.stringify(pipeline.stages))); // Deep copy
  };

  const handleStageChange = (index: number, newName: string) => {
      const newStages = [...tempStages];
      newStages[index].name = newName;
      setTempStages(newStages);
  };

  const handleAddStage = () => {
      setTempStages([...tempStages, { id: `temp-${Date.now()}`, name: 'New Stage', position: tempStages.length }]);
  };

  const handleDeleteStage = (index: number) => {
      const newStages = tempStages.filter((_, i) => i !== index);
      // Re-index positions
      newStages.forEach((s, i) => s.position = i);
      setTempStages(newStages);
  };

  const handleSaveStages = async () => {
      if (!editingPipeline) return;
      setIsLoading(true);

      // 1. Identify deleted stages (exist in original but not in temp)
      const originalIds = new Set(editingPipeline.stages.map(s => s.id));
      const currentIds = new Set(tempStages.filter(s => !s.id.startsWith('temp')).map(s => s.id));
      const deletedIds = editingPipeline.stages.filter(s => !currentIds.has(s.id)).map(s => s.id);

      if (deletedIds.length > 0) {
          const { error } = await supabase.from('stages').delete().in('id', deletedIds);
          if (error) {
              toast({ title: 'Error', description: 'Failed to delete stages.', variant: 'destructive' });
              setIsLoading(false);
              return;
          }
      }

      // 2. Upsert (Update existing + Insert new)
      const upsertData = tempStages.map((s, index) => ({
          id: s.id.startsWith('temp') ? undefined : s.id, // undefined ID triggers insert
          pipeline_id: editingPipeline.id,
          name: s.name,
          position: index
      }));

      const { error } = await supabase.from('stages').upsert(upsertData);
      
      if (error) {
          toast({ title: 'Error', description: 'Failed to save stages.', variant: 'destructive' });
      } else {
          toast({ title: 'Success', description: 'Pipeline updated.' });
          setEditingPipeline(null);
          fetchPipelines();
      }
      setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Pipelines for {userName}</DialogTitle>
          {editingPipeline && <DialogDescription>Editing stages for: {editingPipeline.name}</DialogDescription>}
        </DialogHeader>
        
        {editingPipeline ? (
            <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setEditingPipeline(null)} className="mb-2">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Pipelines
                </Button>

                <div className="space-y-2">
                    {tempStages.map((stage, index) => (
                        <div key={stage.id} className="flex gap-2 items-center">
                            <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                            <Input 
                                value={stage.name} 
                                onChange={(e) => handleStageChange(index, e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteStage(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handleAddStage}>
                        <Plus className="h-4 w-4 mr-2" /> Add Stage
                    </Button>
                    <Button onClick={handleSaveStages} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex gap-2 items-end">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="pipeName">New Pipeline Name</Label>
                        <Input 
                            id="pipeName" 
                            value={newPipelineName} 
                            onChange={e => setNewPipelineName(e.target.value)} 
                            placeholder="e.g., Enterprise Sales" 
                        />
                    </div>
                    <Button onClick={handleCreatePipeline}><Plus className="h-4 w-4 mr-2"/> Create</Button>
                </div>

                <div className="border rounded-md p-4 space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">Existing Pipelines</h4>
                    {isLoading ? <p>Loading...</p> : pipelines.length === 0 ? <p>No pipelines found.</p> : (
                        pipelines.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-muted/50 rounded border">
                                <div>
                                    <p className="font-medium">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.stages.length} Stages: {p.stages.map(s => s.name).join(', ')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(p)}>
                                        <Pencil className="h-4 w-4 mr-2" /> Edit Stages
                                    </Button>
                                    <CsvUploader 
                                        onUploadComplete={() => {}} 
                                        targetUserId={userId}
                                        targetPipelineId={p.id}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleDeletePipeline(p.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
