'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Cog } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function GhlSettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true);
      return;
    }
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setUserName(profile?.full_name || user.email || null);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [isOpen, supabase]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary-foreground transition-all hover:bg-primary-hover w-full text-left">
          <Cog className="h-4 w-4" />
          Settings
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences here.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4">Loading...</div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Connected As
              </Label>
              <div className="col-span-2 font-medium">{userName}</div>
            </div>
             <Button asChild>
                <Link href="/settings/signature">Edit Email Signature</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
