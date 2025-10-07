import AnalyticsClient from '@/components/analytics/analytics-client';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <AnalyticsClient />
    </div>
  );
}
