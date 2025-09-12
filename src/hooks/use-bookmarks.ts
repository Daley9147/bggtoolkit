"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '@/lib/types';
import { useToast } from './use-toast';

const BOOKMARKS_STORAGE_KEY = 'bgg-sales-toolkit-bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (error) {
      console.error('Failed to load bookmarks from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const persistBookmarks = (updatedBookmarks: Bookmark[]) => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks to localStorage', error);
    }
  };

  const addBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks((prevBookmarks) => {
      const newBookmarks = [...prevBookmarks, bookmark];
      persistBookmarks(newBookmarks);
      toast({ title: "Bookmarked!", description: "Content saved for quick access." });
      return newBookmarks;
    });
  }, [toast]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((prevBookmarks) => {
      const newBookmarks = prevBookmarks.filter((b) => b.id !== bookmarkId);
      persistBookmarks(newBookmarks);
      toast({ title: "Bookmark removed." });
      return newBookmarks;
    });
  }, [toast]);

  const isBookmarked = useCallback((bookmarkId: string) => {
    return bookmarks.some((b) => b.id === bookmarkId);
  }, [bookmarks]);
  
  const toggleBookmark = useCallback((bookmark: Bookmark) => {
    if (isBookmarked(bookmark.id)) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark(bookmark);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);


  return { bookmarks, toggleBookmark, isBookmarked, isLoaded };
}
