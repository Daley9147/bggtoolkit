'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  body: string;
  dateAdded: string;
}

interface MissionMetricsNotesTabProps {
  notes: Note[];
  isLoading: boolean;
  contactId: string;
  onNoteAdded: () => void;
}

export default function MissionMetricsNotesTab({
  notes,
  isLoading,
  contactId,
  onNoteAdded,
}: MissionMetricsNotesTabProps) {
  const [callNotes, setCallNotes] = useState('');
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [logCallSuccess, setLogCallSuccess] = useState(false);
  const [logCallError, setLogCallError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogCall = async () => {
    if (!contactId || !callNotes.trim()) return;
    setIsLoggingCall(true);
    setLogCallError(null);
    setLogCallSuccess(false);
    try {
      const response = await fetch(`/api/mission-metrics/notes/${contactId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: callNotes }),
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
        description: 'Call notes successfully added to Mission Metrics GHL.',
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
        <h4 className="font-semibold mb-2">Log Call Notes</h4>
        <Textarea
          value={callNotes}
          onChange={(e) => setCallNotes(e.target.value)}
          placeholder="Enter notes from your call..."
          className="w-full"
          rows={5}
        />
        <Button
          onClick={handleLogCall}
          disabled={isLoggingCall || !callNotes.trim()}
          className="mt-2"
        >
          {isLoggingCall
            ? 'Logging...'
            : logCallSuccess
            ? 'Logged to GHL!'
            : 'Log Call to GHL'}
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
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {note.body}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(note.dateAdded).toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <p>No notes found for this contact.</p>
      )}
    </div>
  );
}
