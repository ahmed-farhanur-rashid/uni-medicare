'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { appointmentsApi, consultationsApi, prescriptionsApi, labResultsApi, billingApi, type AppointmentResponse, type ConsultationResponse, type PrescriptionResponse, type LabResultResponse, type InvoiceResponse } from '@/lib/api';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import StatsCard from '@/components/ui/StatsCard';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function StudentDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [labResults, setLabResults] = useState<LabResultResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    async function loadData() {
      try {
        const [appts, consults, labs, inv] = await Promise.all([
          appointmentsApi.getMy().catch(() => ({ data: [] })),
          consultationsApi.getMy().catch(() => ({ data: [] })),
          labResultsApi.getMy().catch(() => ({ data: [] })),
          billingApi.getMyInvoices().catch(() => ({ data: [] })),
        ]);
        setAppointments(appts.data);
        setConsultations(consults.data);
        setLabResults(labs.data);
        setInvoices(inv.data);

        // Load prescriptions from consultations
        const prescs: PrescriptionResponse[] = [];
        for (const c of consults.data) {
          try {
            const p = await prescriptionsApi.getById(c.consultId);
            prescs.push(p.data);
          } catch {
            // consultation may not have a prescription
          }
        }
        setPrescriptions(prescs);
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated, router]);

  if (loading) return <DashboardSkeleton />;

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed'
  );
  const pendingInvoices = invoices.filter(
    (i) => i.transactionStatus === 'pending'
  );
  const totalPending = pendingInvoices.reduce(
    (sum, i) => sum + i.totalAmount,
    0
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Health Portal"
        description="Welcome back. Here's an overview of your medical activity."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up stagger-1 opacity-0">
          <StatsCard
            title="Upcoming Appointments"
            value={upcomingAppointments.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
          />
        </div>
        <div className="animate-fade-in-up stagger-2 opacity-0">
          <StatsCard
            title="Consultations"
            value={consultations.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            }
          />
        </div>
        <div className="animate-fade-in-up stagger-3 opacity-0">
          <StatsCard
            title="Lab Results"
            value={labResults.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            }
          />
        </div>
        <div className="animate-fade-in-up stagger-4 opacity-0">
          <StatsCard
            title="Pending Balance"
            value={formatCurrency(totalPending)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="animate-fade-in-up stagger-3 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian font-display">Upcoming Appointments</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/student/appointments')}>
                View all
              </Button>
            </div>
            <div className="divide-y divide-border/30">
              {upcomingAppointments.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
                  title="No upcoming appointments"
                  description="Book an appointment with a doctor to get started."
                  action={<Button size="sm" onClick={() => router.push('/student/appointments')}>Book Appointment</Button>}
                />
              ) : (
                upcomingAppointments.slice(0, 4).map((apt) => (
                  <div key={apt.appointmentId} className="px-6 py-4 flex items-center gap-4 hover:bg-cream-warm/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald-deep shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-obsidian truncate">
                        Dr. {apt.doctorName}
                      </p>
                      <p className="text-xs text-slate-muted truncate">
                        {apt.reason || 'General checkup'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-obsidian">
                        {formatDateTime(apt.scheduledTime)}
                      </p>
                      <StatusBadge status={apt.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Lab Results */}
        <Card className="animate-fade-in-up stagger-4 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian font-display">Lab Results</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/student/lab-results')}>
                View all
              </Button>
            </div>
            <div className="divide-y divide-border/30">
              {labResults.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>}
                  title="No lab results yet"
                  description="Your lab results will appear here after your consultation."
                />
              ) : (
                labResults.slice(0, 4).map((lr) => (
                  <div key={lr.resultId} className="px-6 py-4 flex items-center gap-4 hover:bg-cream-warm/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-sky/10 flex items-center justify-center text-sky shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-obsidian truncate">
                        {lr.labTestName}
                      </p>
                      <p className="text-xs text-slate-muted">
                        {lr.resultValue ? `Result: ${lr.resultValue}` : 'Pending'}
                      </p>
                    </div>
                    <StatusBadge status={lr.resultStatus} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="animate-fade-in-up stagger-5 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian font-display">Prescriptions</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/student/prescriptions')}>
                View all
              </Button>
            </div>
            <div className="divide-y divide-border/30">
              {prescriptions.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
                  title="No prescriptions yet"
                  description="Prescriptions from your doctor will appear here."
                />
              ) : (
                prescriptions.slice(0, 4).map((p) => (
                  <div key={p.prescriptionId} className="px-6 py-4 hover:bg-cream-warm/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-obsidian">
                          {p.diagnosis || 'General prescription'}
                        </p>
                        <p className="text-xs text-slate-muted mt-0.5">
                          {p.labTests.length} lab test{p.labTests.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="text-xs text-silver shrink-0">
                        {formatDate(p.prescriptionDate)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card className="animate-fade-in-up stagger-6 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian font-display">Invoices</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/student/invoices')}>
                View all
              </Button>
            </div>
            <div className="divide-y divide-border/30">
              {invoices.length === 0 ? (
                <EmptyState
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
                  title="No invoices"
                  description="Your invoices will appear here after consultations."
                />
              ) : (
                invoices.slice(0, 4).map((inv) => (
                  <div key={inv.invoiceId} className="px-6 py-4 flex items-center gap-4 hover:bg-cream-warm/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-obsidian">
                        Invoice #{inv.invoiceId}
                      </p>
                      <p className="text-xs text-slate-muted">
                        {formatDate(inv.invoiceDate)} · {inv.lineItems.length} item{inv.lineItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-obsidian">
                        {formatCurrency(inv.totalAmount)}
                      </p>
                      <StatusBadge status={inv.transactionStatus} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
