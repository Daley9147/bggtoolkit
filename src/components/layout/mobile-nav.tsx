'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Briefcase, LayoutDashboard, Bookmark, Calendar, PenSquare, Sparkles, Gamepad2, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();

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
            <span>Sales Toolkit</span>
          </Link>
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
            href="/saved"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/saved' }
            )}
          >
            <Bookmark className="h-5 w-5" />
            Company Research
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
          <Link
            href="/escape"
            className={cn(
              'mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:bg-primary-hover',
              { 'bg-primary-hover': pathname === '/escape' }
            )}
          >
            <Gamepad2 className="h-5 w-5" />
            Escape
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
