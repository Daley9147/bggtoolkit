'use client';

import { Bookmark as BookmarkIcon } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import type { Bookmark } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BookmarkButtonProps {
  item: Bookmark;
}

export default function BookmarkButton({ item }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, isLoaded } = useBookmarks();
  const bookmarked = isBookmarked(item.id);

  if (!isLoaded) {
    return (
      <Button variant="ghost" size="sm" disabled className="h-auto p-1">
        <BookmarkIcon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleBookmark(item)}
            className={cn('text-accent-foreground/70 hover:text-accent-foreground h-auto p-1', {
              'text-accent': bookmarked,
            })}
          >
            <BookmarkIcon
              className={cn('h-4 w-4 transition-colors', {
                'fill-current': bookmarked,
              })}
            />
             <span className="sr-only">
              {bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{bookmarked ? 'Remove bookmark' : 'Add bookmark'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
