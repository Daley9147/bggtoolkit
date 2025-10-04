'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface GhlCalendar {
  id: string;
  name: string;
  bookingLink: string;
}

interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  appointmentStatus: 'confirmed' | 'cancelled' | 'showed' | 'noshow' | 'new';
}

export default function CalendarsClient() {
  const [calendars, setCalendars] = useState<GhlCalendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchCalendars = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ghl/calendars');
        if (response.status === 404) {
          setIsConnected(false);
          return;
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch calendars');
        }
        const data = await response.json();
        setCalendars(data);
        if (data.length > 0) {
          setSelectedCalendarId(data[0].id);
        }
        setIsConnected(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendars();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedCalendarId || !selectedDate) return;
      setIsAppointmentsLoading(true);
      try {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const url = new URL('/api/ghl/appointments', window.location.origin);
        url.searchParams.append('calendarId', selectedCalendarId);
        url.searchParams.append('startDate', startDate.toISOString());
        url.searchParams.append('endDate', endDate.toISOString());
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(message);
      } finally {
        setIsAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedCalendarId, selectedDate]);

  if (isLoading) {
    return <div className="text-center p-8">Loading GHL Calendars...</div>;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-card text-card-foreground">
        <p className="mb-4">Connect your GHL account to see your calendars.</p>
        <Button asChild>
          <Link href="/api/oauth/redirect">Connect to GHL</Link>
        </Button>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Your Calendars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {calendars.map((cal) => (
                <div 
                  key={cal.id} 
                  className={`p-3 cursor-pointer ${selectedCalendarId === cal.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedCalendarId(cal.id)}
                >
                  <h3 className="font-semibold">{cal.name}</h3>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          <div>
            <h2 className="font-headline text-xl font-semibold mb-4">
              Appointments for {selectedDate ? format(selectedDate, 'PPP') : ''}
            </h2>
            {isAppointmentsLoading ? (
              <p>Loading appointments...</p>
            ) : (
              <div className="space-y-4">
                {appointments.length > 0 ? (
                  appointments.map((app) => (
                    <div key={app.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold">{app.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(app.startTime), 'p')} - {format(new Date(app.endTime), 'p')}
                      </p>
                      <p className="text-sm capitalize mt-1">{app.appointmentStatus}</p>
                    </div>
                  ))
                ) : (
                  <p>No appointments for this day.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
