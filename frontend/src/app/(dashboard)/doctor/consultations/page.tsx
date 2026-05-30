'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { consultationsApi, type ConsultationResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function DoctorConsultationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedConsult, setSelectedConsult] = useState<ConsultationResponse | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }

    async function loadData() {
      try {
        const res = await consultationsApi.getMy();
        setConsultations(res.data);
      } catch {} finally { setLoading(false); }
    }
    loadData();
  }, [isAuthenticated, router]);

  const handleUpdateNotes = async () => {
    if (!selectedConsult) return;
    setSaving(true);
    try {
      await consultationsApi.updateNotes(selectedConsult.consultId, notes);
      setSelectedConsult(null);
      loadData();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Consultations" description="View and manage your patient consultations." />

      {loading ? <TableSkeleton rows={5} cols={3} /> : consultations.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>} title="No consultations yet" description="Consultations will appear here once you start seeing patients." /></Card>
      ) : (
        <div className="space-y-3">
          {consultations.map((c, i) => (
            <Card key={c.consultId} hover className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky/10 flex items-center justify-center text-sky shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-obsidian">{c.patientName}</p>
                    <p className="text-sm text-slate-muted mt-0.5">{formatDateTime(c.consultTime)}</p>
                    {c.notes && <p className="text-sm text-slate-soft mt-2 line-clamp-2">{c.notes}</p>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedConsult(c); setNotes(c.notes || ''); }}>Update Notes</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedConsult} onClose={() => setSelectedConsult(null)} title="Update Consultation Notes">
        <div className="space-y-4">
          {selectedConsult && (
            <div className="p-3 rounded-xl bg-cream-warm border border-border/40">
              <p className="text-sm font-medium text-obsidian">{selectedConsult.patientName}</p>
              <p className="text-xs text-slate-muted">{formatDateTime(selectedConsult.consultTime)}</p>
            </div>
          )}
          <textarea className="w-full h-32 rounded-xl border border-border bg-white px-4 py-3 text-sm text-obsidian placeholder:text-silver transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted resize-none" placeholder="Enter consultation notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSelectedConsult(null)}>Cancel</Button>
            <Button isLoading={saving} onClick={handleUpdateNotes}>Save Notes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
