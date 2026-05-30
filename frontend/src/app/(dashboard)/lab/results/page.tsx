'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { labResultsApi, type LabResultResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function LabResultsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [results, setResults] = useState<LabResultResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedResult, setSelectedResult] = useState<LabResultResponse | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [resultNotes, setResultNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }

    async function loadResults() {
      try {
        const res = await labResultsApi.getMy();
        setResults(res.data);
      } catch {} finally { setLoading(false); }
    }
    loadResults();
  }, [isAuthenticated, router]);

  const handleUpdate = async () => {
    if (!selectedResult) return;
    setSaving(true);
    try {
      await labResultsApi.update(selectedResult.resultId, {
        resultValue,
        resultNotes,
        resultStatus: 'completed',
      });
      setSelectedResult(null);
      loadResults();
    } catch {} finally { setSaving(false); }
  };

  const filtered = filter === 'all' ? results : results.filter((r) => r.resultStatus === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Lab Results" description="Review and update lab test results." />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-emerald text-white shadow-sm' : 'bg-white text-slate-muted border border-border hover:border-emerald hover:text-emerald'}`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <TableSkeleton rows={5} cols={3} /> : filtered.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" /></svg>} title="No lab results" description="No lab results match your filter." /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <Card key={r.resultId} hover className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky/10 flex items-center justify-center text-sky shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-obsidian">{r.labTestName}</p>
                      <StatusBadge status={r.resultStatus} />
                    </div>
                    <p className="text-sm text-slate-muted mt-0.5">{formatDateTime(r.createdAt)} · {r.resultValue ? `Result: ${r.resultValue}` : 'Awaiting results'}</p>
                  </div>
                  {r.resultStatus === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedResult(r); setResultValue(''); setResultNotes(''); }}>Enter Results</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedResult} onClose={() => setSelectedResult(null)} title="Enter Lab Results">
        <div className="space-y-4">
          {selectedResult && (
            <div className="p-3 rounded-xl bg-cream-warm border border-border/40">
              <p className="text-sm font-medium text-obsidian">{selectedResult.labTestName}</p>
            </div>
          )}
          <Input label="Result Value" placeholder="Enter test result" value={resultValue} onChange={(e) => setResultValue(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-slate-mid mb-1.5">Notes</label>
            <textarea className="w-full h-24 rounded-xl border border-border bg-white px-4 py-3 text-sm text-obsidian placeholder:text-silver transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted resize-none" placeholder="Additional notes..." value={resultNotes} onChange={(e) => setResultNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSelectedResult(null)}>Cancel</Button>
            <Button isLoading={saving} onClick={handleUpdate}>Submit Results</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
