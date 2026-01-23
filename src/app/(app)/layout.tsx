import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Suspense } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Suspense fallback={<div className="hidden border-r bg-muted/40 md:block w-[220px] lg:w-[280px]" />}>
        <Sidebar />
      </Suspense>
      <div className="flex flex-col min-w-0">
<Header />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
