'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { adminApi, type Department } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminDepartmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }

    async function loadDepartments() {
      try {
        const res = await adminApi.getDepartments();
        setDepartments(res.data);
      } catch {} finally { setLoading(false); }
    }
    loadDepartments();
  }, [isAuthenticated, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createDepartment(form);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      loadDepartments();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await adminApi.deleteDepartment(id);
      loadDepartments();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" description="Manage medical center departments." actions={<Button onClick={() => setShowCreate(true)}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>Add Department</Button>} />

      {loading ? <TableSkeleton rows={5} cols={3} /> : departments.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" /></svg>} title="No departments" description="Add departments to organize your medical center." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d, i) => (
            <Card key={d.departmentId} hover className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-obsidian font-display">{d.name}</h3>
                    <p className="text-sm text-slate-muted mt-1">{d.description || 'No description'}</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(d.departmentId)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-slate-mid mb-1.5">Description</label>
            <textarea className="w-full h-24 rounded-xl border border-border bg-white px-4 py-3 text-sm text-obsidian placeholder:text-silver transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted resize-none" placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Create Department</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
