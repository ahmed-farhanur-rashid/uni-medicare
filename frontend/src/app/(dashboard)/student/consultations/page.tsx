'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { consultationsApi, type ConsultationResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function StudentConsultationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    async function loadData() {
      try {
        const res = await consultationsApi.getMy();
        setConsultations(res.data);
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
        title="Consultations"
        description="View your consultation history and clinical notes."
      />

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : consultations.length === 0 ? (
        <Card>
          <EmptyState
            icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>}
            title="No consultations yet"
            description="Your consultation records will appear here after your first visit."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {consultations.map((c, i) => (
            <Card
              key={c.consultId}
              hover
              className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet/10 flex items-center justify-center text-violet shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-obsidian dark:text-gray-100">
                        Consultation #{c.consultId}
                      </p>
                      {c.appointmentId && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald/10 text-emerald-deep text-[11px] font-medium">
                          Appointment #{c.appointmentId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-muted dark:text-gray-500 mt-0.5">
                      With {c.staffName} · {formatDateTime(c.consultTime)}
                    </p>
                    {c.notes && (
                      <div className="mt-3 p-3 rounded-xl bg-cream-warm dark:bg-white/5 border border-gray-200 dark:border-[#1e2737]">
                        <p className="text-xs font-medium text-slate-muted dark:text-gray-500 mb-1">Clinical Notes</p>
                        <p className="text-sm text-obsidian dark:text-gray-100">{c.notes}</p>
                      </div>
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
