'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Briefcase, LayoutDashboard, Bookmark, Calendar, PenSquare, Sparkles, ListTodo, Mail, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function MobileNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === 'darrel@missionmetrics.io') {
          setIsAdmin(true);
      }
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data?.role === 'admin') setIsAdmin(true);
      }
    };
    checkRole();
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col bg-primary text-primary-foreground">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>
        <nav className="grid gap-2 text-lg font-medium">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
            <span>Mission Metrics</span>
          </Link>
          {isAdmin && (
            <Link
              href="/staff"
              className={cn(
                'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
                { 'bg-primary-hover': pathname === '/staff' }
              )}
            >
              <Users className="h-5 w-5" />
              My Staff
            </Link>
          )}
          <Link
            href="/toolkit"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/toolkit' }
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Toolkit
          </Link>
          <Link
            href="/opportunities"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/opportunities' }
            )}
          >
            <Briefcase className="h-5 w-5" />
            Opportunities
          </Link>
          <Link
            href="/contacts"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/contacts' }
            )}
          >
            <Users className="h-5 w-5" />
            Contacts
          </Link>
          <Link
            href="/calendars"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/calendars' }
            )}
          >
            <Calendar className="h-5 w-5" />
            Calendar
          </Link>
          <Link
            href="/ai"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/ai' }
            )}
          >
            <Sparkles className="h-5 w-5" />
            AI Insights
          </Link>
          <Link
            href="/email-outreach"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/email-outreach' }
            )}
          >
            <Mail className="h-5 w-5" />
            Email Outreach
          </Link>
          <Link
            href="/tasks"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/tasks' }
            )}
          >
            <ListTodo className="h-5 w-5" />
            Tasks
          </Link>
          <Link
            href="/workspace"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname.startsWith('/workspace') }
            )}
          >
            <PenSquare className="h-5 w-5" />
            Workspace
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
