'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfile() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0][0];
  };

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{getInitials(userName || '')}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{userName}</span>
    </div>
  );
}
