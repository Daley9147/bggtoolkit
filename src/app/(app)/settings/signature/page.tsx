'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignatureEditorPage() {
  const [emailSignature, setEmailSignature] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const JoditEditor = useMemo(() => dynamic(() => import('jodit-react'), { ssr: false }), []);

  useEffect(() => {
    const fetchSignature = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_signature')
          .eq('id', user.id)
          .single();
        setEmailSignature(profile?.email_signature || '');
      }
      setIsLoading(false);
    };
    fetchSignature();
  }, [supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ email_signature: emailSignature })
        .eq('id', user.id);
    }
    setIsSaving(false);
    toast({
      title: 'Signature saved',
      description: 'Your email signature has been updated successfully.',
    });
  };

  const editorConfig = useMemo(() => ({
    readonly: false,
    height: 400,
    uploader: {
      url: '/api/user/signature/upload',
      format: 'json',
      filesVariableName: () => 'files[]',
      isSuccess: (resp: any) => resp.success,
      process: (resp: any) => {
        return {
          files: resp.files.map((f: any) => f.url), // Jodit expects simple array of strings or specific object
          path: '',
          baseurl: '',
          error: resp.error,
          msg: resp.error
        };
      },
      defaultHandlerSuccess: function (data: any, resp: any) {
        // @ts-ignore
        const files = data.files || [];
        if (files.length) {
          // @ts-ignore
          this.selection.insertImage(files[0]);
        }
      },
    },
    filebrowser: {
      ajax: {
        url: '/api/user/signature/browse',
      },
    },
  }), []);

  return (
    <div className="space-y-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Toolkit
        </Link>
        <Card>
            <CardHeader>
                <CardTitle>Edit Email Signature</CardTitle>
                <CardDescription>
                    This signature will be used when sending emails from the toolkit.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>Loading signature...</p>
                ) : (
                    <JoditEditor
                        value={emailSignature}
                        config={editorConfig}
                        onBlur={newContent => setEmailSignature(newContent)}
                    />
                )}
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Signature'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
