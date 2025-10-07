import Link from 'next/link';
import Image from 'next/image';
import { Book, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Header() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
                src="https://umwvwdiphmjchbwagtlc.supabase.co/storage/v1/object/public/site-logos/Business-Global-Growth-logo.png"
                alt="BGG Logo"
                width={250}
                height={75}
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-2xl font.headline font-bold">Sales Toolkit</h1>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/bookmarks">
                <Book className="h-5 w-5" />
                <span className="sr-only">Bookmarks</span>
              </Link>
            </Button>
            {user ? (
              <form action={signOut}>
                <Button variant="ghost">
                  Log out
                </Button>
              </form>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login">
                  Log in
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
