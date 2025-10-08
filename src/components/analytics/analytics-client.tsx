'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Phone, Mail, Target, Award, Clock, ListTodo, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';

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
  highPriorityTasksCount: number;
  mediumPriorityTasksCount: number;
  lowPriorityTasksCount: number;
  highPriorityTasks: { title: string }[];
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
  // Initialize with 'all' or a value that prevents fetching until the saved one is loaded.
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedPipelineId = localStorage.getItem('selectedAnalyticsPipeline');
    // Use 'all' as a fallback if nothing is saved.
    setSelectedPipelineId(savedPipelineId ? JSON.parse(savedPipelineId) : 'all');
  }, []);

  useEffect(() => {
    // Prevent fetching on initial render before the saved ID is loaded.
    if (selectedPipelineId === undefined) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL('/api/analytics', window.location.origin);
        if (selectedPipelineId && selectedPipelineId !== 'all') {
          url.searchParams.append('pipelineId', selectedPipelineId);
        }
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data.');
        }
        const jsonData = await response.json();
        setData(jsonData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedPipelineId]);

  const handlePipelineChange = (value: string) => {
    setSelectedPipelineId(value);
    localStorage.setItem('selectedAnalyticsPipeline', JSON.stringify(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select onValueChange={handlePipelineChange} value={selectedPipelineId}>
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
        <Card>
          <CardHeader>
            <CardTitle>Task Hub</CardTitle>
            <CardDescription>Your team's current task workload.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-24 w-full" /> : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{data?.highPriorityTasksCount}</p>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{data?.mediumPriorityTasksCount}</p>
                  <p className="text-xs text-muted-foreground">Medium Priority</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{data?.lowPriorityTasksCount}</p>
                  <p className="text-xs text-muted-foreground">Low Priority</p>
                </div>
              </div>
            )}
            <Separator className="my-4" />
            <h3 className="text-sm font-semibold mb-2">Urgent Tasks</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {data?.highPriorityTasks?.slice(0, 2).map((task, index) => (
                  <div key={index} className="flex items-center p-2 bg-slate-50 rounded-md">
                    <AlertTriangle className="h-4 w-4 mr-3 text-red-500" />
                    <p className="font-medium text-sm">{task.title}</p>
                  </div>
                ))}
                {data?.highPriorityTasks?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No high-priority tasks!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
