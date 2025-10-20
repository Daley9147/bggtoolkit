'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  template_name: string;
  subject_line: string;
  body: string;
}

export default function EmailOutreachClient() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateBody, setTemplateBody] = useState('');
  const { toast } = useToast();

  const placeholders = [
    '{{firstName}}',
    '{{lastName}}',
    '{{fullName}}',
    '{{companyName}}',
    '{{industry}}',
    '{{summary}}',
    '{{strategicGoals}}',
    '{{outreachHook}}',
    '{{caseStudy}}',
  ];

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch email templates.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const templateData = {
      template_name: formData.get('template_name') as string,
      subject_line: formData.get('subject_line') as string,
      body: templateBody,
    };

    const url = selectedTemplate ? `/api/email-templates/${selectedTemplate.id}` : '/api/email-templates';
    const method = selectedTemplate ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      toast({
        title: 'Success',
        description: `Template ${selectedTemplate ? 'updated' : 'created'} successfully.`,
      });
      setIsDialogOpen(false);
      fetchTemplates(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not save the template.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/email-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast({
        title: 'Success',
        description: 'Template deleted successfully.',
      });
      fetchTemplates(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not delete the template.',
        variant: 'destructive',
      });
    }
  };

  const openDialog = (template: EmailTemplate | null = null) => {
    setSelectedTemplate(template);
    setTemplateBody(template?.body || '');
    setIsDialogOpen(true);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, placeholder: string) => {
    e.dataTransfer.setData('text/plain', placeholder);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const placeholder = e.dataTransfer.getData('text/plain');
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + placeholder + text.substring(end);
    setTemplateBody(newText);
    
    // Move cursor to after the inserted placeholder
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Template
        </Button>
      </div>

      {isLoading ? (
        <p>Loading templates...</p>
      ) : templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{template.template_name}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{template.subject_line}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{template.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No templates found. Create one to get started!</p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    name="template_name"
                    defaultValue={selectedTemplate?.template_name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject_line">Subject Line</Label>
                  <Input
                    id="subject_line"
                    name="subject_line"
                    defaultValue={selectedTemplate?.subject_line}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="body">Body</Label>
                  <Textarea
                    id="body"
                    name="body"
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    required
                    rows={15}
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <Label>Placeholders</Label>
                <p className="text-xs text-muted-foreground mb-2">Drag and drop into the body</p>
                <div className="space-y-2">
                  {placeholders.map((tag) => (
                    <div
                      key={tag}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tag)}
                      className="cursor-grab rounded-md bg-secondary px-2 py-1 text-sm font-mono"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
