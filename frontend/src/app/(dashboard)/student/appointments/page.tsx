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
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function StudentAppointmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [filter, setFilter] = useState('all');
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    scheduledTime: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    async function loadAppointments() {
      try {
        const res = await appointmentsApi.getMy();
        setAppointments(res.data);
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, [isAuthenticated, router]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentsApi.create({
        patientId: 0,
        doctorId: parseInt(bookingData.doctorId, 10),
        scheduledTime: bookingData.scheduledTime,
        reason: bookingData.reason,
      });
      setShowBooking(false);
      setBookingData({ doctorId: '', scheduledTime: '', reason: '' });
      loadAppointments();
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  const filtered =
    filter === 'all'
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage your medical appointments."
        actions={
          <Button onClick={() => setShowBooking(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Book Appointment
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-emerald text-white shadow-sm'
                : 'bg-white text-slate-muted border border-border hover:border-emerald hover:text-emerald'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
            title="No appointments found"
            description="Book your first appointment to get started with your healthcare."
            action={<Button onClick={() => setShowBooking(true)}>Book Appointment</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt, i) => (
            <Card
              key={apt.appointmentId}
              hover
              className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-deep shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-obsidian">
                        Dr. {apt.doctorName}
                      </p>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-sm text-slate-muted mt-0.5">
                      {apt.department || 'General'} · {apt.reason || 'General checkup'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-obsidian">
                      {formatDateTime(apt.scheduledTime)}
                    </p>
                    {apt.cancellationReason && (
                      <p className="text-xs text-rose mt-1">
                        {apt.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        title="Book Appointment"
      >
        <form onSubmit={handleBook} className="space-y-4">
          <Input
            label="Doctor ID"
            type="number"
            placeholder="Enter doctor's employee ID"
            value={bookingData.doctorId}
            onChange={(e) =>
              setBookingData({ ...bookingData, doctorId: e.target.value })
            }
            required
          />
          <Input
            label="Appointment Date & Time"
            type="datetime-local"
            value={bookingData.scheduledTime}
            onChange={(e) =>
              setBookingData({
                ...bookingData,
                scheduledTime: e.target.value,
              })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-mid mb-1.5">
              Reason
            </label>
            <textarea
              className="w-full h-24 rounded-xl border border-border bg-white px-4 py-3 text-sm text-obsidian placeholder:text-silver transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted resize-none"
              placeholder="Describe your reason for the visit"
              value={bookingData.reason}
              onChange={(e) =>
                setBookingData({ ...bookingData, reason: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowBooking(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Book Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
