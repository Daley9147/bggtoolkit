'use client';

import { useState, useTransition } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAiTalkingPoints } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface AiRefinementDialogProps {
  content: string;
}

export default function AiRefinementDialog({ content }: AiRefinementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [generatedPoints, setGeneratedPoints] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    startTransition(async () => {
      setGeneratedPoints('');
      const result = await getAiTalkingPoints({ content, keywords });
      if (result.success && result.data) {
        setGeneratedPoints(result.data.talkingPoints);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to generate talking points.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-accent-foreground/70 hover:text-accent-foreground h-auto p-1"
      >
        <Wand2 className="h-4 w-4" />
        <span className="sr-only">Refine with AI</span>
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">AI Talking Point Refinement</DialogTitle>
          <DialogDescription>
            Enter keywords or a client profile to generate talking points from this content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="keywords">Keywords / Client Profile</Label>
            <Textarea
              id="keywords"
              placeholder="e.g., 'early-stage startup', 'concerned about ROI', 'manufacturing industry'"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          {isPending && (
             <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          )}
          {generatedPoints && (
            <div className="rounded-md border bg-muted/50 p-4">
              <h4 className="mb-2 font-headline font-semibold">Generated Points:</h4>
              <p className="whitespace-pre-wrap text-sm">{generatedPoints}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isPending || !keywords}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
