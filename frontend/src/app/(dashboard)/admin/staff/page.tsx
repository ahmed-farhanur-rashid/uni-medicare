'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { adminApi, type MedicalStaffResponse } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminStaffPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [staff, setStaff] = useState<MedicalStaffResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', roleName: '', departmentName: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }

    async function loadStaff() {
      try {
        const res = await adminApi.getStaff();
        setStaff(res.data);
      } catch {} finally { setLoading(false); }
    }
    loadStaff();
  }, [isAuthenticated, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createStaff(form);
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '', password: '', roleName: '', departmentName: '' });
      loadStaff();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await adminApi.deleteStaff(id);
      loadStaff();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" description="Manage medical staff members." actions={<Button onClick={() => setShowCreate(true)}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>Add Staff</Button>} />

      {loading ? <TableSkeleton rows={5} cols={4} /> : staff.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>} title="No staff members" description="Add staff to get started." /></Card>
      ) : (
        <div className="space-y-3">
          {staff.map((s, i) => (
            <Card key={s.medicalStaffId} hover className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky/10 flex items-center justify-center text-sky shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-obsidian">{s.name}</p>
                      <StatusBadge status={s.isActive ? 'completed' : 'cancelled'} />
                    </div>
                    <p className="text-sm text-slate-muted mt-0.5">{s.roleName} · {s.departmentName}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(s.medicalStaffId)}>Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Staff Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" placeholder="staff@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Password" type="password" placeholder="Set a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Role" placeholder="e.g. Doctor, Nurse" value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })} required />
          <Input label="Department" placeholder="e.g. Cardiology" value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} required />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Create Staff</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
