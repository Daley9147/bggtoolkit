'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfDay, endOfDay, add, isSameDay, parseISO } from 'date-fns';

interface GhlCalendar {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  appointmentStatus: 'confirmed' | 'cancelled' | 'showed' | 'noshow' | 'new';
  contact?: { 
    name: string;
    companyName?: string;
  };
  address?: string;
}

export default function CalendarsClient() {
  const [calendars, setCalendars] = useState<GhlCalendar[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
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
    if (selectedCalendarId) {
      const fetchAppointments = async () => {
        setIsAppointmentsLoading(true);
        const startDate = startOfDay(new Date());
        const endDate = endOfDay(add(new Date(), { days: 7 }));
        
        try {
          const appointmentsUrl = new URL('/api/ghl/appointments', window.location.origin);
          appointmentsUrl.searchParams.append('calendarId', selectedCalendarId);
          appointmentsUrl.searchParams.append('startDate', startDate.toISOString());
          appointmentsUrl.searchParams.append('endDate', endDate.toISOString());

          const blockedSlotsUrl = new URL('/api/ghl/blocked-slots', window.location.origin);
          blockedSlotsUrl.searchParams.append('calendarId', selectedCalendarId);
          blockedSlotsUrl.searchParams.append('startDate', startDate.toISOString());
          blockedSlotsUrl.searchParams.append('endDate', endDate.toISOString());

          const [appointmentsResponse, blockedSlotsResponse] = await Promise.all([
            fetch(appointmentsUrl.toString()),
            fetch(blockedSlotsUrl.toString()),
          ]);

          if (!appointmentsResponse.ok) {
            const errorData = await appointmentsResponse.json();
            throw new Error(errorData.error || 'Failed to fetch appointments');
          }
          if (!blockedSlotsResponse.ok) {
            const errorData = await blockedSlotsResponse.json();
            throw new Error(errorData.error || 'Failed to fetch blocked slots');
          }

          const appointmentsData = await appointmentsResponse.json();
          const blockedSlotsData = await blockedSlotsResponse.json();

          const allEvents = [...appointmentsData, ...blockedSlotsData].sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          setAppointments(allEvents);

        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'An unknown error occurred';
          setError(message);
        } finally {
          setIsAppointmentsLoading(false);
        }
      };
      fetchAppointments();
    }
  }, [selectedCalendarId]);

  // Group appointments by day
  const groupedAppointments = appointments.reduce((acc, appt) => {
    const date = format(parseISO(appt.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appt);
    return acc;
  }, {} as Record<string, Appointment[]>);

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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upcoming Week</h1>
        <Select onValueChange={setSelectedCalendarId} value={selectedCalendarId || ''}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a calendar" />
          </SelectTrigger>
          <SelectContent>
            {calendars.map((cal) => (
              <SelectItem key={cal.id} value={cal.id}>
                {cal.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAppointmentsLoading ? (
        <p>Loading appointments...</p>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedAppointments).length > 0 ? (
            Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
              <div key={date}>
                <h2 className="font-headline text-xl font-semibold mb-4 pb-2 border-b">
                  {format(parseISO(date), 'EEEE, MMMM d')}
                </h2>
                <div className="space-y-4">
                  {dayAppointments.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{app.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {app.contact?.name || 'No contact specified'}
                            </p>
                            {app.contact?.companyName && (
                              <p className="text-xs text-muted-foreground font-medium">
                                {app.contact.companyName}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {format(parseISO(app.startTime), 'p')} - {format(parseISO(app.endTime), 'p')}
                            </p>
                            <p className="text-sm capitalize mt-1">{app.appointmentStatus}</p>
                          </div>
                        </div>
                        {app.address && (app.address.startsWith('http://') || app.address.startsWith('https://')) && (
                          <div className="mt-4">
                            <Button asChild size="sm">
                              <a href={app.address} target="_blank" rel="noopener noreferrer">
                                Join Meeting
                              </a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No upcoming appointments for the next 7 days.</p>
          )}
        </div>
      )}
    </div>
  );
}
