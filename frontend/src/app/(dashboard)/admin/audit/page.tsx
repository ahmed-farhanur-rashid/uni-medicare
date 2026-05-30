'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { auditApi, type AuditLog, type PaginatedResponse } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminAuditPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }

    async function loadLogs() {
      try {
        const res = await auditApi.getLogs(page, 20);
        setData(res.data);
      } catch {} finally { setLoading(false); }
    }
    loadLogs();
  }, [isAuthenticated, router, page]);

  const getActionColor = (action: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' => {
    switch (action) {
      case 'INSERT': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'danger';
      case 'LOGIN': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all system changes and user actions." />

      {loading ? <TableSkeleton rows={10} cols={5} /> : !data || data.content.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>} title="No audit logs" description="System activity will appear here." /></Card>
      ) : (
        <>
          <div className="space-y-2">
            {data.content.map((log, i) => (
              <Card key={log.logId} className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
                <CardContent className="py-3 px-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={getActionColor(log.action)} size="sm">{log.action}</Badge>
                      <span className="text-xs text-slate-muted">{log.tableName}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-obsidian">
                        <span className="font-medium">{log.actorType}</span> #{log.actorId}
                        {log.recordId && <span className="text-slate-muted"> — Record #{log.recordId}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-silver">{formatDateTime(log.createdAt)}</p>
                      {log.ipAddress && <p className="text-xs text-slate-muted">{log.ipAddress}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="px-4 py-2 text-sm text-slate-muted">Page {page + 1} of {data.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}
