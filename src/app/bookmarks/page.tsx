import Header from '@/components/layout/header';
import BookmarksClient from '@/components/bookmarks/bookmarks-client';

export default function BookmarksPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <BookmarksClient />
      </main>
    </div>
  );
}
