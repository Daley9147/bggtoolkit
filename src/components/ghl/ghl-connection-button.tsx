'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { LogIn, LogOut } from 'lucide-react';

export default function GhlConnectionButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkConnection = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('ghl_access_token')
          .eq('id', user.id)
          .single();
        setIsConnected(!!profile?.ghl_access_token);
      }
      setIsLoading(false);
    };
    checkConnection();
  }, [supabase]);

  const handleDisconnect = async () => {
    const response = await fetch('/api/ghl/disconnect', {
      method: 'POST',
    });
    if (response.ok) {
      setIsConnected(false);
      router.refresh();
    } else {
      // Handle error
      console.error('Failed to disconnect from GHL');
    }
  };

  if (isLoading) {
    return (
      <div className="px-2 py-2 lg:px-4">
        <Button variant="ghost" className="w-full justify-start" disabled>
          <LogIn className="mr-2 h-4 w-4" />
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 lg:px-4">
      {isConnected ? (
        <Button variant="ghost" className="w-full justify-start" onClick={handleDisconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect GHL
        </Button>
      ) : (
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/api/oauth/redirect">
            <LogIn className="mr-2 h-4 w-4" />
            Connect GHL
          </Link>
        </Button>
      )}
    </div>
  );
}
