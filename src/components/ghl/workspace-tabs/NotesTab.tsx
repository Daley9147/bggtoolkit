'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  id: string;
  body: string;
  dateAdded: string;
}

interface NotesTabProps {
  notes: Note[];
  isLoading: boolean;
  contactId: string;
  onNoteAdded: () => void;
}

export default function NotesTab({
  notes,
  isLoading,
  contactId,
  onNoteAdded,
}: NotesTabProps) {
  const [callNotes, setCallNotes] = useState('');
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [logCallSuccess, setLogCallSuccess] = useState(false);
  const [logCallError, setLogCallError] = useState<string | null>(null);

  const handleLogCall = async () => {
    if (!contactId || !newNote) return;
    setIsLoggingCall(true);
    setLogError(null);
    try {
      const response = await fetch('/api/ghl/log-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contactId,
          note: newNote,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log call');
      }
      setNewNote('');
      onNoteAdded(); // Refresh the notes list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setLogError(message);
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
          disabled={isLoggingCall || logCallSuccess}
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
