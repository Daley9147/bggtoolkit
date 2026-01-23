'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Briefcase, LayoutDashboard, Calendar, PenSquare, Sparkles, ListTodo, Mail, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import GhlSettingsDialog from '@/components/ghl/ghl-settings-dialog';
import UserProfile from '@/components/layout/user-profile';
import { createClient } from '@/lib/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Sidebar user check:', user?.id, user?.email);
      
      // Fallback: Check email directly
      if (user?.email === 'darrel@missionmetrics.io') {
          setIsAdmin(true);
      }

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        console.log('Sidebar profile check:', data, error);
        if (data?.role === 'admin') setIsAdmin(true);
      }
    };
    checkRole();
  }, []);

  return (
    <div className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b border-white/20 px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="">Mission Metrics</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-semibold lg:px-4">
            {isAdmin && (
              <>
                <Link
                  href="/staff"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                    {
                      'bg-white text-primary shadow-sm': pathname === '/staff',
                    }
                  )}
                >
                  <Users className="h-4 w-4" />
                  My Staff
                </Link>
              </>
            )}
            <Link
              href="/toolkit"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname === '/toolkit',
                }
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Toolkit
            </Link>
            <Link
              href="/opportunities"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname === '/opportunities',
                }
              )}
            >
              <Briefcase className="h-4 w-4" />
              Opportunities
            </Link>
            <Link
              href="/contacts"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname === '/contacts',
                }
              )}
            >
              <Users className="h-4 w-4" />
              Contacts
            </Link>
            <Link
              href="/email"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname === '/email',
                }
              )}
            >
              <Mail className="h-4 w-4" />
              Inbox
            </Link>
            <Link
              href="/calendars"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname === '/calendars',
                }
              )}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Link>
            <Link
              href="/ai"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname === '/ai',
                }
              )}
            >
              <Sparkles className="h-4 w-4" />
              AI Insights
            </Link>
            <Link
              href="/email-outreach"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname === '/email-outreach',
                }
              )}
            >
              <Mail className="h-4 w-4" />
              Email Outreach
            </Link>
            <Link
              href="/tasks"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname === '/tasks',
                }
              )}
            >
              <ListTodo className="h-4 w-4" />
              Tasks
            </Link>
            <Link
              href="/workspace"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-white text-primary shadow-sm': pathname.startsWith('/workspace'),
                }
              )}
            >
              <PenSquare className="h-4 w-4" />
              Workspace
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-white/20">
          <GhlSettingsDialog />
          <UserProfile />
        </div>
      </div>
    </div>
  );
}
