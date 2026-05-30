'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { adminApi, auditApi, type StudentResponse, type MedicalStaffResponse, type PaginatedResponse, type AuditLog } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/ui/StatsCard';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [students, setStudents] = useState<PaginatedResponse<StudentResponse> | null>(null);
  const [staff, setStaff] = useState<MedicalStaffResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }

    async function loadData() {
      try {
        const [s, st, a] = await Promise.all([
          adminApi.getStudents(0, 5).catch(() => null),
          adminApi.getStaff().catch(() => ({ data: [] })),
          auditApi.getLogs(0, 5).catch(() => null),
        ]);
        setStudents(s?.data || null);
        setStaff(st.data);
        setAuditLogs(a?.data || null);
      } catch {} finally { setLoading(false); }
    }
    loadData();
  }, [isAuthenticated, router]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" description="Manage the medical center system." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up stagger-1 opacity-0">
          <StatsCard title="Students" value={students?.totalElements || 0} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-2 opacity-0">
          <StatsCard title="Staff Members" value={staff.length} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>} />
        </div>
        <div className="animate-fade-in-up stagger-3 opacity-0">
          <StatsCard title="Audit Logs" value={auditLogs?.totalElements || 0} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up stagger-3 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian font-display">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {[
                { label: 'Students', href: '/admin/students', color: 'emerald' },
                { label: 'Staff', href: '/admin/staff', color: 'sky' },
                { label: 'Departments', href: '/admin/departments', color: 'violet' },
                { label: 'Services', href: '/admin/services', color: 'amber' },
                { label: 'Audit Logs', href: '/admin/audit', color: 'rose' },
              ].map((item) => (
                <button key={item.href} onClick={() => router.push(item.href)} className={`p-4 rounded-xl border border-border hover:border-${item.color} hover:bg-${item.color}/5 transition-all text-center group`}>
                  <p className="text-sm font-medium text-obsidian group-hover:text-current">{item.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-4 opacity-0">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian font-display">Recent Staff</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/staff')}>View all</Button>
            </div>
            <div className="divide-y divide-border/30">
              {staff.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-muted">No staff members found.</div>
              ) : staff.slice(0, 5).map((s) => (
                <div key={s.medicalStaffId} className="px-6 py-4 flex items-center gap-4 hover:bg-cream-warm/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-sky/10 flex items-center justify-center text-sky shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-obsidian truncate">{s.name}</p>
                    <p className="text-xs text-slate-muted">{s.roleName} · {s.departmentName}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${s.isActive ? 'bg-emerald' : 'bg-silver'}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
