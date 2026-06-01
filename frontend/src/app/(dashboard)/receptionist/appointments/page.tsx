'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { appointmentsApi, type AppointmentResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

export default function ReceptionistAppointmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  async function loadAppointments() {
    try {
      const res = await appointmentsApi.getAll();
      setAppointments(res.data);
    } catch { toast('Failed to load appointments.', 'error'); } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    loadAppointments();
  }, [isAuthenticated, router]);

  const handleAdvance = async (id: number) => {
    try {
      const apt = appointments.find(a => a.appointmentId === id);
      if (!apt) return;
      const next = apt.status === 'booked' ? 'arrived' : apt.status === 'arrived' ? 'in_progress' : 'completed';
      await appointmentsApi.advanceStatus(id, next);
      loadAppointments();
      toast(`Appointment marked as ${next.replace('_', ' ')}.`, 'success');
    } catch { toast('Failed to update status.', 'error'); }
  };

  const handleNoShow = async (id: number) => {
    try {
      await appointmentsApi.markNoShow(id);
      loadAppointments();
      toast('Appointment marked as no-show.', 'success');
    } catch { toast('Failed to mark no-show.', 'error'); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Manage all patient appointments." />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'booked', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-emerald text-white shadow-sm' : 'bg-white dark:bg-gray-900 text-slate-muted dark:text-gray-500 border border-gray-200 dark:border-[#1e2737] hover:border-emerald hover:text-emerald'}`}>
            {f === 'all' ? 'All' : f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? <TableSkeleton rows={5} cols={4} /> : filtered.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>} title="No appointments found" description="No appointments match your filter." /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt, i) => (
            <Card key={apt.appointmentId} hover className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-deep shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-obsidian dark:text-gray-100">{apt.patientName} — Dr. {apt.doctorName}</p>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-sm text-slate-muted dark:text-gray-500 mt-0.5">{apt.department || 'General'} · {apt.reason || 'General checkup'}</p>
                    <p className="text-xs text-slate-muted dark:text-gray-500 mt-0.5">Deposit: ${apt.depositAmount}{apt.refundAmount > 0 ? ` · Refunded: $${apt.refundAmount}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-medium text-obsidian dark:text-gray-100">{formatDateTime(apt.scheduledTime)}</p>
                    {apt.status === 'booked' && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => handleAdvance(apt.appointmentId)}>Arrived</Button>
                        <Button size="sm" variant="danger" onClick={() => handleNoShow(apt.appointmentId)}>No Show</Button>
                      </div>
                    )}
                    {apt.status === 'arrived' && (
                      <Button size="sm" onClick={() => handleAdvance(apt.appointmentId)}>Start</Button>
                    )}
                    {apt.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleAdvance(apt.appointmentId)}>Complete</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
