'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Phone, Mail, Target, Award, DollarSign, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Pipeline {
  id: string;
  name: string;
}

interface RecentActivity {
  id: string;
  name: string;
  stageName: string;
  lastStageChangeAt: string;
}

interface AnalyticsData {
  pipelines: Pipeline[];
  todaysAppointments: number;
  insightsCompletedToday: number;
  emailsSentToday: number;
  callsLoggedToday: number;
  appointmentsBookedToday: number;
  opportunitiesWon: number;
  recentActivity: RecentActivity[];
}

function StatCard({ title, value, icon: Icon, isLoading }: { title: string; value: string | number; icon: React.ElementType; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL('/api/analytics', window.location.origin);
        if (selectedPipelineId) {
          url.searchParams.append('pipelineId', selectedPipelineId);
        }
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data.');
        }
        const jsonData = await response.json();
        setData(jsonData);

        // If no pipeline is selected, default to the first one
        if (!selectedPipelineId && jsonData.pipelines?.length > 0) {
          setSelectedPipelineId(jsonData.pipelines[0].id);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedPipelineId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select onValueChange={(value) => setSelectedPipelineId(value === 'all' ? '' : value)} value={selectedPipelineId || 'all'}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a pipeline..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pipelines</SelectItem>
            {data?.pipelines?.map((pipeline) => (
              <SelectItem key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Appointments" value={data?.todaysAppointments ?? 0} icon={Calendar} isLoading={isLoading} />
        <StatCard title="Appointments Booked Today" value={data?.appointmentsBookedToday ?? 0} icon={Target} isLoading={isLoading} />
        <StatCard title="Emails Sent Today" value={data?.emailsSentToday ?? 0} icon={Mail} isLoading={isLoading} />
        <StatCard title="Calls Logged Today" value={data?.callsLoggedToday ?? 0} icon={Phone} isLoading={isLoading} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Opportunities Won Today" value={data?.opportunitiesWon ?? 0} icon={Award} isLoading={isLoading} />
        {/* Placeholder for a future metric */}
        <Card><CardHeader><CardTitle className="text-sm font-medium">Future Metric</CardTitle></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>The last 5 opportunities to change stage in this pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {data?.recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">{activity.stageName}</p>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(activity.lastStageChangeAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
