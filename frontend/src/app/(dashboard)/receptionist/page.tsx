'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { appointmentsApi, type AppointmentResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function ReceptionistDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    loadData();
  }, [isAuthenticated, router]);

  async function loadData() {
    try {
      const res = await appointmentsApi.getAll();
      setAppointments(res.data);
    } catch {} finally { setLoading(false); }
  }

  if (loading) return <DashboardSkeleton />;

  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.scheduledTime);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const scheduled = appointments.filter((a) => a.status === 'scheduled');
  const completed = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="space-y-8">
      <PageHeader title="Receptionist Dashboard" description="Manage appointments and billing for the medical center." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="animate-fade-in-up stagger-1 opacity-0">
          <StatsCard title="Today's Appointments" value={todayAppts.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-2 opacity-0">
          <StatsCard title="Scheduled" value={scheduled.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-3 opacity-0">
          <StatsCard title="Completed" value={completed.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up stagger-3 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 dark:border-white/[0.06] flex items-center justify-between">
              <h2 className="font-semibold text-obsidian dark:text-gray-100 font-display">Today&apos;s Schedule</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/receptionist/appointments')}>View all</Button>
            </div>
            <div className="divide-y divide-border/30 dark:divide-white/[0.06]">
              {todayAppts.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>} title="No appointments today" description="The schedule is clear for today." />
              ) : todayAppts.slice(0, 5).map((apt) => (
                <div key={apt.appointmentId} className="px-6 py-4 flex items-center gap-4 hover:bg-cream-warm/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-deep shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-obsidian dark:text-gray-100 truncate">{apt.patientName} — Dr. {apt.doctorName}</p>
                    <p className="text-xs text-slate-muted dark:text-gray-500 truncate">{apt.reason || 'General checkup'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-obsidian dark:text-gray-100">{formatDateTime(apt.scheduledTime)}</p>
                    <StatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-4 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 dark:border-white/[0.06] flex items-center justify-between">
              <h2 className="font-semibold text-obsidian dark:text-gray-100 font-display">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              <button onClick={() => router.push('/receptionist/appointments')} className="p-4 rounded-xl border border-border dark:border-white/[0.08] hover:border-emerald hover:bg-emerald/5 transition-all text-center group">
                <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-deep mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                </div>
                <p className="text-sm font-medium text-obsidian dark:text-gray-100">Appointments</p>
              </button>
              <button onClick={() => router.push('/receptionist/billing')} className="p-4 rounded-xl border border-border dark:border-white/[0.08] hover:border-amber hover:bg-amber/5 transition-all text-center group">
                <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                </div>
                <p className="text-sm font-medium text-obsidian dark:text-gray-100">Billing</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
