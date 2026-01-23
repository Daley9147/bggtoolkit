'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CsvUploader({ 
  onUploadComplete, 
  targetUserId, 
  targetPipelineId 
}: { 
  onUploadComplete: () => void;
  targetUserId?: string;
  targetPipelineId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listName, setListName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!listName.trim()) {
      toast({ title: "Error", description: "Please enter a List Name before uploading.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        // Strip BOM if present
        const safeText = text.replace(/^\uFEFF/, '');
        const lines = safeText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) return;

        // Detect delimiter: tab, semicolon, or comma
        const firstLine = lines[0];
        const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') ? ';' : ',');
        
        // Robust CSV Line Parser
        const parseLine = (line: string) => {
            const values = [];
            let currentValue = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    // Toggle quote state
                    if (inQuotes && line[i+1] === '"') {
                        // Handle escaped quote ("") inside quoted string
                        currentValue += '"';
                        i++; 
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === delimiter && !inQuotes) {
                    values.push(currentValue.trim());
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            values.push(currentValue.trim());
            return values;
        };

        // Parse headers
        const headers = parseLine(lines[0]).map(h => h.toLowerCase());
        
        // Parse data rows
        const data = lines.slice(1).map(line => {
          const rowValues = parseLine(line);
          const obj: any = {};
          headers.forEach((h, i) => {
            obj[h] = rowValues[i] || ''; // Handle missing values at end of line
          });
          return obj;
        });

        const response = await fetch('/api/crm/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, targetUserId, targetPipelineId, listName }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to upload');
        }

        toast({ title: 'Success', description: `Imported ${data.length} records.` });
        setIsOpen(false);
        onUploadComplete();
      } catch (error: any) {
        console.error('Upload error:', error);
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Opportunities</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import your opportunities and contacts into the CRM.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Upload your CSV. The system will map headers like <b>First Name, Last Name, Title, Company Name, Email, Website, Annual Revenue</b>, etc.
          </p>
          <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Note: To generate Mission Insights, ensure your CSV includes a column for <b>Identifier</b> (Charity Number or EIN).
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">List Name</label>
            <Input 
              placeholder="e.g. Non Profits 2024" 
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </div>
          <Input 
            ref={fileInputRef}
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            disabled={isLoading}
          />
          {isLoading && <p className="text-sm text-center">Importing...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
