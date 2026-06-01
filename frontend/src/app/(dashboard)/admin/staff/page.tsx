'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { adminApi, type MedicalStaffResponse, type Department } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import ConfirmPasswordModal from '@/components/ui/ConfirmPasswordModal';

const ROLES = ['DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RECEPTIONIST', 'ADMIN'];

const SPECIALTIES = [
  'General Medicine',
  'Counseling',
  'Pathology',
  'Emergency Medicine',
  'Physiotherapy',
  'Gynecology',
  'Urology',
];

const ROLE_ORDER = ['DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RECEPTIONIST', 'ADMIN'];
const ROLE_LABELS: Record<string, string> = {
  DOCTOR: 'Doctors',
  NURSE: 'Nurses',
  LAB_TECHNICIAN: 'Lab Technicians',
  RECEPTIONIST: 'Receptionists',
  ADMIN: 'Admins',
};

export default function AdminStaffPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [staff, setStaff] = useState<MedicalStaffResponse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', roleName: '', departmentId: '', specialty: '' });
  const [saving, setSaving] = useState(false);

  // Password confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'create' | 'delete'>('create');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  async function loadStaff() {
    try {
      const res = await adminApi.getStaff();
      setStaff(res.data);
    } catch { toast('Failed to load staff.', 'error'); } finally { setLoading(false); }
  }

  async function loadDepartments() {
    try {
      const res = await adminApi.getDepartments();
      setDepartments(res.data);
    } catch { /* silent */ }
  }

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    loadStaff();
    loadDepartments();
  }, [isAuthenticated, router]);

  const groupedStaff = ROLE_ORDER
    .filter((role) => staff.some((s) => s.roleName === role))
    .map((role) => ({
      role,
      label: ROLE_LABELS[role] || role,
      members: staff.filter((s) => s.roleName === role),
    }));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmAction('create');
    setDeleteTargetId(null);
    setConfirmOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmAction('delete');
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const handleConfirmPassword = async (password: string) => {
    setConfirmLoading(true);
    try {
      const verifyRes = await adminApi.verifyPassword(password);
      if (!verifyRes.data.valid) {
        toast('Incorrect admin password.', 'error');
        setConfirmLoading(false);
        setConfirmOpen(false);
        return;
      }

      if (confirmAction === 'create') {
        const roleMap: Record<string, number> = { DOCTOR: 1, NURSE: 2, LAB_TECHNICIAN: 3, RECEPTIONIST: 4, ADMIN: 5 };
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: { roleId: roleMap[form.roleName] },
          specialty: form.specialty || null,
        };
        if (form.departmentId) {
          payload.department = { departmentId: Number(form.departmentId) };
        }
        await adminApi.createStaff(payload as any);
        setShowCreate(false);
        setForm({ name: '', email: '', phone: '', password: '', roleName: '', departmentId: '', specialty: '' });
        loadStaff();
        toast('Staff member created successfully.', 'success');
      } else if (confirmAction === 'delete' && deleteTargetId) {
        await adminApi.deleteStaff(deleteTargetId);
        loadStaff();
        toast('Staff member deleted successfully.', 'success');
      }
    } catch {
      toast('Operation failed.', 'error');
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" description="Manage medical staff members." actions={<Button onClick={() => setShowCreate(true)}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>Add Staff</Button>} />

      {loading ? <TableSkeleton rows={5} cols={4} /> : staff.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>} title="No staff members" description="Add staff to get started." /></Card>
      ) : (
        <div className="space-y-6">
          {groupedStaff.map((group) => (
            <div key={group.role}>
              <h3 className="text-sm font-semibold text-obsidian dark:text-gray-100 mb-3 flex items-center gap-2">
                <span className="text-lg">{group.label}</span>
                <span className="text-xs bg-slate-muted/10 dark:bg-white/10 text-slate-muted dark:text-gray-500 px-2 py-0.5 rounded-full">{group.members.length}</span>
              </h3>
              <div className="space-y-3">
                {group.members.map((s, i) => (
                  <Card key={s.medicalStaffId} hover className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky/10 flex items-center justify-center text-sky shrink-0">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-obsidian dark:text-gray-100">{s.name}</p>
                            <StatusBadge status={s.isActive ? 'completed' : 'cancelled'} />
                          </div>
                          <p className="text-sm text-slate-muted dark:text-gray-500 mt-0.5">{s.email} {s.departmentName ? `· ${s.departmentName}` : ''}{s.specialty ? ` · ${s.specialty}` : ''}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="danger" size="sm" onClick={() => handleDelete(s.medicalStaffId)}>Delete</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Staff Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" placeholder="staff@university.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Password" type="password" placeholder="Set a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div>
            <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">Role</label>
            <select
              value={form.roleName}
              onChange={(e) => setForm({ ...form, roleName: e.target.value, specialty: '', departmentId: '' })}
              className="w-full px-3 py-2 text-sm border border-border dark:border-white/[0.08] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 bg-white dark:bg-white/5 text-obsidian dark:text-gray-100"
              required
            >
              <option value="">Select role</option>
              {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          {form.roleName === 'DOCTOR' ? (
            <div>
              <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">Specialty</label>
              <select
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border dark:border-white/[0.08] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 bg-white dark:bg-white/5 text-obsidian dark:text-gray-100"
                required
              >
                <option value="">Select specialty</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="text-xs text-slate-muted dark:text-gray-500 mt-1">Department is auto-assigned based on specialty</p>
            </div>
          ) : form.roleName && form.roleName !== '' ? (
            <div>
              <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">Department</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border dark:border-white/[0.08] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 bg-white dark:bg-white/5 text-obsidian dark:text-gray-100"
              >
                <option value="">No department</option>
                {departments.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.name}</option>)}
              </select>
            </div>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Create Staff</Button>
          </div>
        </form>
      </Modal>

      <ConfirmPasswordModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmPassword}
        title={confirmAction === 'create' ? 'Confirm Staff Creation' : 'Confirm Staff Deletion'}
        description={confirmAction === 'create'
          ? 'Enter your admin password to create this staff member.'
          : 'Enter your admin password to permanently delete this staff member.'}
        isLoading={confirmLoading}
      />
    </div>
  );
}
