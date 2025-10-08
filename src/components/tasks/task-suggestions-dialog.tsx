'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle } from 'lucide-react'

interface TaskSuggestionsDialogProps {
  isOpen: boolean
  onClose: () => void
  onTaskAdd: (title: string) => void
  opportunityName: string
  contactName: string
}

export default function TaskSuggestionsDialog({
  isOpen,
  onClose,
  onTaskAdd,
  opportunityName,
  contactName,
}: TaskSuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchSuggestions = async () => {
    setIsLoading(true)
    setError(null)
    setSuggestions([])
    try {
      const response = await fetch('/api/ai/suggest-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityName, contactName }),
      })
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }
      const data = await response.json()
      setSuggestions(data.suggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI-Powered Task Suggestions</DialogTitle>
          <DialogDescription>
            Let AI suggest the next steps for this opportunity. Click "Add" to create a task.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {suggestions.length === 0 && !isLoading && !error && (
            <div className="text-center">
              <Button onClick={handleFetchSuggestions}>Generate Suggestions</Button>
            </div>
          )}
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                  <p>{suggestion}</p>
                  <Button size="sm" onClick={() => onTaskAdd(suggestion)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
