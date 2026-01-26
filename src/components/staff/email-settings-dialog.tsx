'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';

interface EmailSettingsDialogProps {
    userId: string;
    userName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EmailSettingsDialog({ userId, userName, isOpen, onOpenChange }: EmailSettingsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
      imap_host: '',
      imap_port: 993,
      imap_user: '',
      imap_password: '',
      smtp_host: '',
      smtp_port: 465,
      smtp_user: '',
      smtp_password: ''
  });
  
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
        fetchSettings();
    }
  }, [isOpen, userId]);

  const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid error if not found

      if (data) {
          setFormData({
              imap_host: data.imap_host || '',
              imap_port: data.imap_port || 993,
              imap_user: data.imap_user || '',
              imap_password: data.imap_password || '',
              smtp_host: data.smtp_host || '',
              smtp_port: data.smtp_port || 465,
              smtp_user: data.smtp_user || '',
              smtp_password: data.smtp_password || ''
          });
      } else {
          // Reset if new
          setFormData({
              imap_host: '',
              imap_port: 993,
              imap_user: '',
              imap_password: '',
              smtp_host: '',
              smtp_port: 465,
              smtp_user: '',
              smtp_password: ''
          });
      }
      setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
      setSaving(true);
      
      const payload = {
          user_id: userId,
          ...formData,
          imap_port: Number(formData.imap_port),
          smtp_port: Number(formData.smtp_port)
      };

      const { error } = await supabase
        .from('email_accounts')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
          console.error(error);
          toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
      } else {
          toast({ title: 'Success', description: 'Email settings saved.' });
          onOpenChange(false);
      }
      setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Settings for {userName}</DialogTitle>
          <DialogDescription>Configure IMAP (Incoming) and SMTP (Outgoing) settings.</DialogDescription>
        </DialogHeader>

        {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
            <div className="grid gap-6 py-4" key={userId}>
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold border-b pb-2">IMAP Settings (Incoming)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="imap_host">IMAP Host</Label>
                            <Input 
                                id="imap_host" 
                                name="imap_host" 
                                placeholder="imap.gmail.com" 
                                value={formData.imap_host} 
                                onChange={handleChange} 
                                disabled={saving}
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imap_port">IMAP Port</Label>
                            <Input 
                                id="imap_port" 
                                name="imap_port" 
                                type="number" 
                                placeholder="993" 
                                value={formData.imap_port} 
                                onChange={handleChange} 
                                disabled={saving}
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imap_user">Username</Label>
                            <Input 
                                id="imap_user" 
                                name="imap_user" 
                                placeholder="email@example.com" 
                                value={formData.imap_user} 
                                onChange={handleChange} 
                                disabled={saving}
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imap_password">Password</Label>
                            <Input 
                                id="imap_password" 
                                name="imap_password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.imap_password} 
                                onChange={handleChange} 
                                disabled={saving}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold border-b pb-2">SMTP Settings (Outgoing)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="smtp_host">SMTP Host</Label>
                            <Input 
                                id="smtp_host" 
                                name="smtp_host" 
                                placeholder="smtp.gmail.com" 
                                value={formData.smtp_host} 
                                onChange={handleChange} 
                                disabled={saving}
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_port">SMTP Port</Label>
                            <Input 
                                id="smtp_port" 
                                name="smtp_port" 
                                type="number" 
                                placeholder="465" 
                                value={formData.smtp_port} 
                                onChange={handleChange} 
                                disabled={saving}
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_user">Username</Label>
                            <Input 
                                id="smtp_user" 
                                name="smtp_user" 
                                placeholder="email@example.com" 
                                value={formData.smtp_user} 
                                onChange={handleChange} 
                                disabled={saving}
                                autoComplete="off"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_password">Password</Label>
                            <Input 
                                id="smtp_password" 
                                name="smtp_password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.smtp_password} 
                                onChange={handleChange} 
                                disabled={saving}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
