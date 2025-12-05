'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LayoutDashboard, Bookmark, Calendar, PenSquare, Sparkles, Gamepad2, ListTodo, Mail, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import GhlSettingsDialog from '@/components/ghl/ghl-settings-dialog';
import UserProfile from '@/components/layout/user-profile';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-primary text-primary-foreground md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b border-white/20 px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="">Sales Toolkit</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/toolkit"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-primary-hover': pathname === '/toolkit',
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
                  'bg-primary-hover': pathname === '/opportunities',
                }
              )}
            >
              <Briefcase className="h-4 w-4" />
              Opportunities
            </Link>
            <Link
              href="/mission-metrics"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-primary-hover': pathname === '/mission-metrics',
                }
              )}
            >
              <Target className="h-4 w-4" />
              Mission Metrics
            </Link>
            <Link
              href="/calendars"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-primary-hover': pathname === '/calendars',
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
                  'bg-primary-hover': pathname === '/ai',
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
                  'bg-primary-hover': pathname === '/email-outreach',
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
                  'bg-primary-hover': pathname === '/tasks',
                }
              )}
            >
              <ListTodo className="h-4 w-4" />
              Tasks
            </Link>
            <Link
              href="/saved"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-primary-hover': pathname === '/saved',
                }
              )}
            >
              <Bookmark className="h-4 w-4" />
              Company Research
            </Link>
            <Link
              href="/workspace"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-primary-hover': pathname.startsWith('/workspace'),
                }
              )}
            >
              <PenSquare className="h-4 w-4" />
              Workspace
            </Link>
            <Link
              href="/escape"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-primary-hover',
                {
                  'bg-primary-hover': pathname === '/escape',
                }
              )}
            >
              <Gamepad2 className="h-4 w-4" />
              Escape
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
