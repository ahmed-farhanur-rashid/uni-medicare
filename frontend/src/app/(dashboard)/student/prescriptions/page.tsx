'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { consultationsApi, prescriptionsApi, type PrescriptionResponse } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';

export default function StudentPrescriptionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const consults = await consultationsApi.getMy();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescriptions"
        description="View your prescriptions, medicines, and lab test orders."
      />

      {loading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : prescriptions.length === 0 ? (
        <Card>
          <EmptyState
            icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
            title="No prescriptions yet"
            description="Prescriptions from your doctor will appear here after your consultation."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p, i) => (
            <Card
              key={p.prescriptionId}
              className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}
            >
              <CardContent>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-obsidian font-display text-lg">
                      Prescription #{p.prescriptionId}
                    </h3>
                    <p className="text-sm text-slate-muted">
                      {formatDate(p.prescriptionDate)}
                      {p.followUpDate &&
                        ` · Follow-up: ${formatDate(p.followUpDate)}`}
                    </p>
                  </div>
                </div>

                {p.chiefComplaint && (
                  <div className="mb-4 p-3 rounded-xl bg-cream-warm border border-border/40">
                    <p className="text-xs font-medium text-slate-muted mb-1">Chief Complaint</p>
                    <p className="text-sm text-obsidian">{p.chiefComplaint}</p>
                  </div>
                )}

                {p.diagnosis && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald/5 border border-emerald/10">
                    <p className="text-xs font-medium text-emerald-deep mb-1">Diagnosis</p>
                    <p className="text-sm text-obsidian">{p.diagnosis}</p>
                  </div>
                )}

                {p.medicines.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-2">
                      Medicines
                    </p>
                    <div className="space-y-2">
                      {p.medicines.map((med) => (
                        <div
                          key={med.medicineId}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border/40"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose/10 flex items-center justify-center text-rose shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-obsidian">{med.medicineName}</p>
                            <p className="text-xs text-slate-muted">
                              {[med.dosage, med.frequency, med.days ? `${med.days} days` : '']
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                          {med.instructions && (
                            <p className="text-xs text-slate-muted italic max-w-[200px] text-right">
                              {med.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {p.labTests.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-2">
                      Lab Tests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.labTests.map((lt) => (
                        <Badge key={lt.labTestId} variant="info">
                          {lt.labTestName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
