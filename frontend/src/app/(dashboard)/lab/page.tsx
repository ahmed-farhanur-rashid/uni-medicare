'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { labResultsApi, type LabResultResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function LabDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [results, setResults] = useState<LabResultResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    loadData();
  }, [isAuthenticated, router]);

  async function loadData() {
    try {
      const res = await labResultsApi.getMy();
      setResults(res.data);
    } catch {} finally { setLoading(false); }
  }

  if (loading) return <DashboardSkeleton />;

  const pending = results.filter((r) => r.resultStatus === 'pending');
  const completed = results.filter((r) => r.resultStatus === 'completed');

  return (
    <div className="space-y-8">
      <PageHeader title="Lab Technician Dashboard" description="Manage and review lab test results." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="animate-fade-in-up stagger-1 opacity-0">
          <StatsCard title="Pending Results" value={pending.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-2 opacity-0">
          <StatsCard title="Completed Results" value={completed.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-3 opacity-0">
          <StatsCard title="Total Tests" value={results.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>} />
        </div>
      </div>

      <Card className="animate-fade-in-up stagger-3 opacity-0">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border/40 dark:border-white/[0.06] flex items-center justify-between">
            <h2 className="font-semibold text-obsidian dark:text-gray-100 font-display">Pending Lab Results</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/lab/results')}>View all</Button>
          </div>
          <div className="divide-y divide-border/30 dark:divide-white/[0.06]">
            {pending.length === 0 ? (
              <EmptyState icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" /></svg>} title="No pending results" description="All lab results have been completed." />
            ) : pending.slice(0, 5).map((r) => (
              <div key={r.resultId} className="px-6 py-4 flex items-center gap-4 hover:bg-cream-warm/50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-obsidian dark:text-gray-100 truncate">{r.labTestName}</p>
                  <p className="text-xs text-slate-muted dark:text-gray-500">{formatDateTime(r.createdAt)}</p>
                </div>
                <StatusBadge status={r.resultStatus} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
