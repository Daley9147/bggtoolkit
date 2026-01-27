'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  body: string;
  dateAdded: string;
  author?: string;
}

interface MissionMetricsNotesTabProps {
  notes: Note[];
  isLoading: boolean;
  contactId?: string;
  opportunityId?: string;
  onNoteAdded: () => void;
}

export default function MissionMetricsNotesTab({
  notes,
  isLoading,
  contactId,
  opportunityId,
  onNoteAdded,
}: MissionMetricsNotesTabProps) {
  const [callNotes, setCallNotes] = useState('');
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [logCallSuccess, setLogCallSuccess] = useState(false);
  const [logCallError, setLogCallError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogCall = async () => {
    if ((!contactId && !opportunityId) || !callNotes.trim()) return;
    setIsLoggingCall(true);
    setLogCallError(null);
    setLogCallSuccess(false);
    try {
      const response = await fetch(`/api/mission-metrics/notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            body: callNotes,
            contactId,
            opportunityId
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log call');
      }
      setCallNotes('');
      setLogCallSuccess(true);
      toast({
        title: 'Note Added',
        description: 'Note successfully added.',
      });
      onNoteAdded(); // Refresh the notes list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setLogCallError(message);
      toast({
        title: 'Error',
        description: `Failed to add note: ${message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoggingCall(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Add Note</h4>
        <Textarea
          value={callNotes}
          onChange={(e) => setCallNotes(e.target.value)}
          placeholder="Enter notes..."
          className="w-full"
          rows={5}
        />
        <Button
          onClick={handleLogCall}
          disabled={isLoggingCall || !callNotes.trim()}
          className="mt-2"
        >
          {isLoggingCall
            ? 'Saving...'
            : logCallSuccess
            ? 'Saved!'
            : 'Save Note'}
        </Button>
        {logCallError && (
          <p className="text-red-500 text-sm mt-2">{logCallError}</p>
        )}
      </div>
      <hr className="my-6" />
      <h4 className="font-semibold mb-4">Existing Notes</h4>
      {isLoading ? (
        <p>Loading notes...</p>
      ) : notes.length > 0 ? (
        <div className="space-y-4">
          {notes
            .sort(
              (a, b) =>
                new Date(b.dateAdded).getTime() -
                new Date(a.dateAdded).getTime()
            )
            .map((note) => (
              <div
                key={note.id}
                className="p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-gray-600">
                        {note.author || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(note.dateAdded).toLocaleString()}
                    </span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {note.body}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <p>No notes found.</p>
      )}
    </div>
  );
}
