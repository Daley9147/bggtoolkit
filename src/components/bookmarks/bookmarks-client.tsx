'use client';

import { useBookmarks } from '@/hooks/use-bookmarks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookmarkX, Inbox } from 'lucide-react';

export default function BookmarksClient() {
  const { bookmarks, toggleBookmark, isLoaded } = useBookmarks();

  if (!isLoaded) {
    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
             <div className="space-y-4">
                <Card className="h-24 animate-pulse bg-muted/50"></Card>
                <Card className="h-24 animate-pulse bg-muted/50"></Card>
                <Card className="h-24 animate-pulse bg-muted/50"></Card>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Bookmarks</h1>
        <p className="text-muted-foreground">Your saved items for quick access.</p>
      </div>

      {bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{bookmark.summary}</CardTitle>
                        <CardDescription>{bookmark.sectionTitle}</CardDescription>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => toggleBookmark(bookmark)}>
                        <BookmarkX className="h-5 w-5 text-destructive" />
                        <span className="sr-only">Remove Bookmark</span>
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{bookmark.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-24 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 font-headline text-2xl font-semibold">No Bookmarks Yet</h2>
            <p className="mt-2 text-muted-foreground">
                Click the bookmark icon on any item to save it here.
            </p>
        </div>
      )}
    </div>
  );
}
