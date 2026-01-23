'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Calendar, Save } from 'lucide-react';

export default function CalendarsClient() {
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('calendly_url')
          .eq('id', user.id)
          .single();
        
        if (data?.calendly_url) {
          setCalendlyUrl(data.calendly_url);
          setSavedUrl(data.calendly_url);
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSaveUrl = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Basic validation
    let urlToSave = calendlyUrl.trim();
    if (urlToSave && !urlToSave.startsWith('http')) {
        urlToSave = 'https://' + urlToSave;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ calendly_url: urlToSave })
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save URL.', variant: 'destructive' });
    } else {
      setSavedUrl(urlToSave);
      toast({ title: 'Success', description: 'Calendly URL updated.' });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">Scheduling</h1>
            <p className="text-muted-foreground">Manage your availability and book meetings.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => window.open('https://calendar.google.com', '_blank')}>
            <Calendar className="h-4 w-4" />
            Open Google Calendar
            <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Your Calendly Configuration</CardTitle>
            <CardDescription>
                Paste your Calendly booking link below to embed it here. This allows you to quickly book slots while talking to clients.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex gap-4 max-w-xl">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="calendly">Calendly URL</Label>
                    <Input 
                        id="calendly" 
                        placeholder="https://calendly.com/your-name" 
                        value={calendlyUrl}
                        onChange={(e) => setCalendlyUrl(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <Button onClick={handleSaveUrl} disabled={isSaving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>

      {savedUrl ? (
        <Card className="overflow-hidden bg-white">
            <div className="w-full h-[700px]">
                <iframe 
                    src={savedUrl} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    title="Calendly Scheduling"
                ></iframe>
            </div>
        </Card>
      ) : (
        <div className="p-12 border-2 border-dashed rounded-lg text-center bg-muted/30">
            <h3 className="text-lg font-semibold mb-2">No Calendar Connected</h3>
            <p className="text-muted-foreground mb-4">Add your Calendly URL above to enable the scheduling interface.</p>
            <Button variant="link" onClick={() => window.open('https://calendly.com', '_blank')}>
                Don't have Calendly? Sign up free.
            </Button>
        </div>
      )}
    </div>
  );
}
