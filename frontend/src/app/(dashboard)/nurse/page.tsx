'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { consultationsApi, type ConsultationResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function NurseDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    loadData();
  }, [isAuthenticated, router]);

  async function loadData() {
    try {
      const res = await consultationsApi.getMy();
      setConsultations(res.data);
    } catch {} finally { setLoading(false); }
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      <PageHeader title="Nurse Dashboard" description="Manage consultations and record patient vitals." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="animate-fade-in-up stagger-1 opacity-0">
          <StatsCard title="My Consultations" value={consultations.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-2 opacity-0">
          <StatsCard title="Pending Vitals" value={consultations.filter((c) => !c.notes).length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>} />
        </div>
      </div>

      <Card className="animate-fade-in-up stagger-3 opacity-0">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1e2737] flex items-center justify-between">
            <h2 className="font-semibold text-obsidian dark:text-gray-100 font-display">Recent Consultations</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/nurse/consultations')}>View all</Button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-[#1e2737]">
            {consultations.length === 0 ? (
              <EmptyState icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>} title="No consultations yet" description="Consultations will appear here." />
            ) : consultations.slice(0, 5).map((c) => (
              <div key={c.consultId} className="px-6 py-4 flex items-center gap-4 hover:bg-cream-warm/50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-deep shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-obsidian dark:text-gray-100 truncate">{c.patientName}</p>
                  <p className="text-xs text-slate-muted dark:text-gray-500">{formatDateTime(c.consultTime)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/nurse/vitals')}>Record Vitals</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
