'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { consultationsApi, appointmentsApi, type ConsultationResponse, type AppointmentResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function DoctorDashboard() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuthStore();
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    loadData();
  }, [isAuthenticated, router]);

  async function loadData() {
    try {
      const [appts] = await Promise.all([
        appointmentsApi.getAll().catch(() => ({ data: [] })),
      ]);
      setAppointments(appts.data.filter((a) => a.doctorId === userId));
      setConsultations((await consultationsApi.getMy().catch(() => ({ data: [] }))).data);
    } catch {} finally { setLoading(false); }
  }

  if (loading) return <DashboardSkeleton />;

  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.scheduledTime);
    const now = new Date();
    return d.toDateString() === now.toDateString() && (a.status === 'scheduled' || a.status === 'confirmed');
  });
  const pendingAppts = appointments.filter((a) => a.status === 'scheduled');

  return (
    <div className="space-y-8">
      <PageHeader title="Doctor Dashboard" description="Your consultations and appointments at a glance." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="animate-fade-in-up stagger-1 opacity-0">
          <StatsCard title="Today's Appointments" value={todayAppts.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-2 opacity-0">
          <StatsCard title="Pending Appointments" value={pendingAppts.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-3 opacity-0">
          <StatsCard title="Total Consultations" value={consultations.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up stagger-3 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian font-display">Today&apos;s Schedule</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/doctor/appointments')}>View all</Button>
            </div>
            <div className="divide-y divide-border/30">
              {todayAppts.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>} title="No appointments today" description="Your schedule for today is clear." />
              ) : todayAppts.map((apt) => (
                <div key={apt.appointmentId} className="px-6 py-4 flex items-center gap-4 hover:bg-cream-warm/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-deep shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-obsidian truncate">{apt.patientName}</p>
                    <p className="text-xs text-slate-muted truncate">{apt.reason || 'General checkup'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-obsidian">{formatDateTime(apt.scheduledTime)}</p>
                    <StatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-4 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian font-display">Recent Consultations</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/doctor/consultations')}>View all</Button>
            </div>
            <div className="divide-y divide-border/30">
              {consultations.length === 0 ? (
                <EmptyState icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>} title="No consultations yet" description="Your consultation history will appear here." />
              ) : consultations.slice(0, 5).map((c) => (
                <div key={c.consultId} className="px-6 py-4 hover:bg-cream-warm/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-obsidian">{c.patientName}</p>
                      <p className="text-xs text-slate-muted">{formatDateTime(c.consultTime)}</p>
                    </div>
                    <p className="text-xs text-silver truncate max-w-[200px]">{c.notes || 'No notes'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
