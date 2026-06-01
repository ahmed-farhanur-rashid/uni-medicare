'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import {
  appointmentsApi,
  doctorsApi,
  type AppointmentResponse,
  type DoctorResponse,
  type SlotResponse,
} from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

export default function StudentAppointmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [filter, setFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [step, setStep] = useState(1);

  const [bookingData, setBookingData] = useState({
    specialty: '',
    doctorId: '',
    date: '',
    slotTime: '',
    reason: '',
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  async function loadAppointments() {
    try {
      const res = await appointmentsApi.getMy();
      setAppointments(res.data);
    } catch {
      toast('Failed to load appointments.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    loadAppointments();
    doctorsApi.getSpecialties().then((res) => setSpecialties(res.data)).catch(() => { toast('Failed to load specialties.', 'error'); });
  }, [isAuthenticated, router]);

  const handleSpecialtyChange = async (specialty: string) => {
    setBookingData({ specialty, doctorId: '', date: '', slotTime: '', reason: '' });
    setDoctors([]);
    setSlots([]);
    setStep(1);
    if (!specialty) return;
    setLoadingDoctors(true);
    try {
      const res = await doctorsApi.getAll(specialty);
      setDoctors(res.data);
      setStep(2);
    } catch {
      toast('Failed to load doctors.', 'error');
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleDoctorChange = async (doctorId: string) => {
    setBookingData({ ...bookingData, doctorId, date: '', slotTime: '' });
    setSlots([]);
    if (!doctorId) { setStep(2); return; }
    setStep(3);
  };

  const loadSlots = useCallback(async () => {
    if (!bookingData.doctorId || !bookingData.date) return;
    setLoadingSlots(true);
    setBookingData(b => ({ ...b, slotTime: '' }));
    try {
      const res = await doctorsApi.getAvailableSlots(parseInt(bookingData.doctorId, 10), bookingData.date);
      setSlots(res.data);
      setStep(4);
    } catch {
      toast('Failed to load available slots.', 'error');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [bookingData.doctorId, bookingData.date, toast]);

  useEffect(() => {
    if (bookingData.doctorId && bookingData.date) loadSlots();
  }, [bookingData.date, bookingData.doctorId, loadSlots]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dt = `${bookingData.date}T${bookingData.slotTime}:00`;
      await appointmentsApi.create({
        doctorId: parseInt(bookingData.doctorId, 10),
        scheduledTime: dt,
        reason: bookingData.reason,
      });
      handleCloseBooking();
      loadAppointments();
      toast('Appointment booked. 50.00 deposit deducted from your account.', 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to book appointment.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseBooking = () => {
    setShowBooking(false);
    setBookingData({ specialty: '', doctorId: '', date: '', slotTime: '', reason: '' });
    setDoctors([]);
    setSlots([]);
    setStep(1);
  };

  const handleCancel = async () => {
    if (!cancellingId) return;
    setSubmitting(true);
    try {
      await appointmentsApi.cancel(cancellingId, cancelReason || undefined);
      setShowCancelModal(false);
      setCancellingId(null);
      setCancelReason('');
      loadAppointments();
      toast('Appointment cancelled.', 'success');
    } catch {
      toast('Failed to cancel appointment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  const selectedDoctor = doctors.find(d => d.id === parseInt(bookingData.doctorId));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage your medical appointments."
        actions={
          <Button onClick={() => { setShowBooking(true); setStep(1); }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Book Appointment
          </Button>
        }
      />

      {/* Deposit info banner */}
      <div className="rounded-xl bg-emerald/5 dark:bg-emerald/10 border border-emerald/20 dark:border-emerald/30 px-4 py-3">
        <p className="text-sm text-emerald-deep dark:text-emerald-light">
          A <strong>50.00 deposit</strong> is required to book. Cancel 2+ hours before for a 2/3 refund. Late cancellation or no-show forfeits the full deposit.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'booked', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-emerald text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-slate-muted dark:text-gray-500 border border-gray-200 dark:border-[#1e2737] hover:border-emerald hover:text-emerald'
            }`}
          >
            {f === 'all' ? 'All' : f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
            action={<Button onClick={() => { setShowBooking(true); setStep(1); }}>Book Appointment</Button>}
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
                      <p className="font-semibold text-obsidian dark:text-gray-100">
                        Dr. {apt.doctorName}
                      </p>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-sm text-slate-muted dark:text-gray-500 mt-0.5">
                      {apt.department || 'General'} · {apt.reason || 'General checkup'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-muted dark:text-gray-500">
                      <span>Deposit: ${apt.depositAmount}</span>
                      {apt.refundAmount > 0 && <span className="text-emerald-deep dark:text-emerald-light">Refunded: ${apt.refundAmount}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-obsidian dark:text-gray-100">
                      {formatDateTime(apt.scheduledTime)}
                    </p>
                    {apt.cancellationReason && (
                      <p className="text-xs text-rose mt-1">{apt.cancellationReason}</p>
                    )}
                    {apt.status === 'booked' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-rose hover:text-rose hover:bg-rose/10"
                        onClick={() => { setCancellingId(apt.appointmentId); setShowCancelModal(true); }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal isOpen={showBooking} onClose={handleCloseBooking} title="Book Appointment">
        <form onSubmit={handleBook} className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 text-xs font-medium mb-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`flex items-center gap-1.5 ${step >= s ? 'text-emerald-deep dark:text-emerald-light' : 'text-slate-muted dark:text-gray-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-emerald text-white' : 'bg-slate-muted/20 dark:bg-white/5'}`}>{s}</span>
                <span className="hidden sm:inline">{s === 1 ? 'Specialty' : s === 2 ? 'Doctor' : s === 3 ? 'Date' : 'Time'}</span>
                {s < 4 && <span className="text-slate-muted/30 dark:text-gray-600 mx-0.5">→</span>}
              </div>
            ))}
          </div>

          {/* Step 1: Specialty */}
          {step >= 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">Specialty</label>
              <select
                className="w-full rounded-xl border border-gray-200 dark:border-[#1e2737] bg-white dark:bg-gray-900 px-4 py-3 text-sm text-obsidian dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted"
                value={bookingData.specialty}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                required
              >
                <option value="">Select a specialty</option>
                {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Step 2: Doctor */}
          {step >= 2 && (
            <div>
              <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">Doctor</label>
              <select
                className="w-full rounded-xl border border-gray-200 dark:border-[#1e2737] bg-white dark:bg-gray-900 px-4 py-3 text-sm text-obsidian dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted disabled:opacity-50 disabled:cursor-not-allowed"
                value={bookingData.doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                required
                disabled={loadingDoctors}
              >
                <option value="">{loadingDoctors ? 'Loading doctors...' : 'Select a doctor'}</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>Dr. {d.name} — {d.department}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Date */}
          {step >= 3 && (
            <div>
              <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">Date</label>
              <Input
                type="date"
                min={today}
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                required
              />
            </div>
          )}

          {/* Step 4: Time Slot */}
          {step >= 4 && (
            <div>
              <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">Available Time Slots</label>
              {loadingSlots ? (
                <div className="text-sm text-slate-muted dark:text-gray-500 py-4 text-center">Loading slots...</div>
              ) : slots.length === 0 ? (
                <div className="text-sm text-slate-muted dark:text-gray-500 py-4 text-center">No available slots for this date.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={slot.status !== 'available'}
                      onClick={() => setBookingData({ ...bookingData, slotTime: slot.time })}
                      className={`py-2 px-1 rounded-lg text-xs font-medium transition-all border ${
                        bookingData.slotTime === slot.time
                          ? 'bg-emerald text-white border-emerald shadow-sm'
                          : slot.status === 'available'
                            ? 'bg-white dark:bg-gray-900 text-obsidian dark:text-gray-100 border-gray-200 dark:border-[#1e2737] hover:border-emerald hover:text-emerald cursor-pointer'
                            : slot.status === 'break'
                              ? 'bg-amber/10 text-amber border-amber/20 dark:bg-amber/20 dark:text-amber dark:border-amber/30 cursor-not-allowed'
                              : 'bg-slate-muted/10 text-slate-muted dark:bg-white/5 dark:text-gray-500 border-transparent cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                      {slot.status === 'break' && <span className="block text-[10px] mt-0.5">Break</span>}
                      {slot.status === 'booked' && <span className="block text-[10px] mt-0.5">Taken</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          {step >= 4 && (
            <div>
              <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">Reason</label>
              <textarea
                className="w-full h-24 rounded-xl border border-gray-200 dark:border-[#1e2737] bg-white dark:bg-gray-900 px-4 py-3 text-sm text-obsidian dark:text-gray-100 placeholder:text-silver dark:placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted resize-none"
                placeholder="Describe your reason for the visit"
                value={bookingData.reason}
                onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
              />
            </div>
          )}

          {/* Selected summary + deposit */}
          {bookingData.slotTime && selectedDoctor && (
            <div className="rounded-xl bg-emerald/5 dark:bg-emerald/10 border border-emerald/20 dark:border-emerald/30 p-3 space-y-1">
              <p className="text-xs font-medium text-emerald-deep dark:text-emerald-light">
                {selectedDoctor.name} · {bookingData.date} at {bookingData.slotTime}
              </p>
              <p className="text-xs text-emerald-deep/70 dark:text-emerald-light/70">
                50.00 deposit will be deducted from your account
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleCloseBooking}>Cancel</Button>
            <Button type="submit" isLoading={submitting} disabled={!bookingData.slotTime || !bookingData.reason}>
              Pay 50.00 & Book
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => { setShowCancelModal(false); setCancellingId(null); setCancelReason(''); }} title="Cancel Appointment">
        <div className="space-y-4">
          <div className="rounded-xl bg-amber/5 dark:bg-amber/10 border border-amber/20 dark:border-amber/30 p-3">
            <p className="text-sm text-amber-deep dark:text-amber">
              Cancelling more than 2 hours before your appointment returns 2/3 of your deposit (33.33). Within 2 hours, you forfeit the full deposit.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">Reason (optional)</label>
            <textarea
              className="w-full h-20 rounded-xl border border-gray-200 dark:border-[#1e2737] bg-white dark:bg-gray-900 px-4 py-3 text-sm text-obsidian dark:text-gray-100 placeholder:text-silver dark:placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted resize-none"
              placeholder="Reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setShowCancelModal(false); setCancellingId(null); setCancelReason(''); }}>Keep Appointment</Button>
            <Button variant="danger" isLoading={submitting} onClick={handleCancel}>Confirm Cancellation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
