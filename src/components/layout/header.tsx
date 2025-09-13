import Link from 'next/link';
import Image from 'next/image';
import { Book, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-4 flex items-center gap-2">
            <Image
                src="https://umwvwdiphmjchbwagtlc.supabase.co/storage/v1/object/public/site-logos/Business-Global-Growth-logo.png"
                alt="BGG Logo"
                width={250}
                height={75}
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
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
          </nav>
        </div>
      </div>
    </header>
  );
}
