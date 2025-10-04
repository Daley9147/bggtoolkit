'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LayoutDashboard, Bookmark, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import GhlConnectionButton from '@/components/ghl/ghl-connection-button';
import UserProfile from '@/components/layout/user-profile';

const navItems = [
  { href: '/', label: 'Toolkit', icon: LayoutDashboard },
  { href: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { href: '/calendars', label: 'Calendars', icon: Calendar },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <UserProfile />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === href && 'bg-muted text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <GhlConnectionButton />
        </div>
      </div>
    </div>
  );
}
