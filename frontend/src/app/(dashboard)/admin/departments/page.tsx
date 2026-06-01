'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { adminApi, type Department, type DepartmentScheduleResponse } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

export default function AdminDepartmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schedules, setSchedules] = useState<DepartmentScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const [showScheduleEdit, setShowScheduleEdit] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [schedForm, setSchedForm] = useState({
    slotDurationMinutes: 20,
    startTime: '08:00',
    endTime: '17:00',
    breakStart: '13:00',
    breakEnd: '13:30',
    isBookable: true,
  });
  const [savingSched, setSavingSched] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [deptRes, schedRes] = await Promise.all([
        adminApi.getDepartments(),
        adminApi.getDepartmentSchedules(),
      ]);
      setDepartments(deptRes.data);
      setSchedules(schedRes.data);
    } catch { toast('Failed to load departments.', 'error'); } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    loadData();
  }, [isAuthenticated, router, loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createDepartment(form);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      loadData();
      toast('Department created successfully.', 'success');
    } catch { toast('Failed to create department.', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await adminApi.deleteDepartment(id);
      loadData();
      toast('Department deleted successfully.', 'success');
    } catch { toast('Failed to delete department.', 'error'); }
  };

  const openScheduleEdit = (dept: Department) => {
    setEditingDept(dept);
    const existing = schedules.find(s => s.departmentId === dept.departmentId);
    if (existing) {
      setSchedForm({
        slotDurationMinutes: existing.slotDurationMinutes,
        startTime: existing.startTime,
        endTime: existing.endTime,
        breakStart: existing.breakStart,
        breakEnd: existing.breakEnd,
        isBookable: existing.isBookable,
      });
    } else {
      setSchedForm({ slotDurationMinutes: 20, startTime: '08:00', endTime: '17:00', breakStart: '13:00', breakEnd: '13:30', isBookable: true });
    }
    setShowScheduleEdit(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setSavingSched(true);
    try {
      await adminApi.updateDepartmentSchedule(editingDept.departmentId, schedForm);
      setShowScheduleEdit(false);
      setEditingDept(null);
      loadData();
      toast('Schedule updated successfully.', 'success');
    } catch { toast('Failed to update schedule.', 'error'); } finally { setSavingSched(false); }
  };

  const getSched = (deptId: number) => schedules.find(s => s.departmentId === deptId);

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const calcSlotsPerDay = (s: DepartmentScheduleResponse) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    const [bs] = s.breakStart.split(':').map(Number);
    const [be] = s.breakEnd.split(':').map(Number);
    const totalMin = (eh * 60 + em) - (sh * 60 + sm);
    const breakMin = (be * 60) - (bs * 60);
    return Math.floor((totalMin - breakMin) / s.slotDurationMinutes);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" description="Manage medical center departments and appointment schedules." actions={<Button onClick={() => setShowCreate(true)}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>Add Department</Button>} />

      {loading ? <TableSkeleton rows={5} cols={3} /> : departments.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" /></svg>} title="No departments" description="Add departments to organize your medical center." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d, i) => {
            const sched = getSched(d.departmentId);
            return (
              <Card key={d.departmentId} hover className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-obsidian dark:text-gray-100 font-display">{d.name}</h3>
                      <p className="text-sm text-slate-muted dark:text-gray-500 mt-1">{d.description || 'No description'}</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(d.departmentId)}>Delete</Button>
                  </div>

                  {sched && (
                    <div className="mt-3 pt-3 border-t border-border dark:border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-mid dark:text-gray-300">Appointment Schedule</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${sched.isBookable ? 'bg-emerald/10 text-emerald-deep dark:bg-emerald/20 dark:text-emerald-light' : 'bg-slate-muted/20 text-slate-muted dark:bg-white/5 dark:text-gray-400'}`}>
                          {sched.isBookable ? 'Bookable' : 'Walk-in Only'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-muted dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Hours:</span>
                          <span className="font-medium text-obsidian dark:text-gray-200">{formatTime(sched.startTime)} – {formatTime(sched.endTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Break:</span>
                          <span className="font-medium text-obsidian dark:text-gray-200">{formatTime(sched.breakStart)} – {formatTime(sched.breakEnd)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slot Duration:</span>
                          <span className="font-medium text-obsidian dark:text-gray-200">{sched.slotDurationMinutes} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Slots/Day:</span>
                          <span className="font-medium text-obsidian dark:text-gray-200">{calcSlotsPerDay(sched)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => openScheduleEdit(d)}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                        Edit Schedule
                      </Button>
                    </div>
                  )}

                  {!sched && (
                    <div className="mt-3 pt-3 border-t border-border dark:border-white/[0.06]">
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => openScheduleEdit(d)}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Set Schedule
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Department Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Department">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">Description</label>
            <textarea className="w-full h-24 rounded-xl border border-border dark:border-white/[0.08] bg-white dark:bg-gray-900 px-4 py-3 text-sm text-obsidian dark:text-gray-100 placeholder:text-silver dark:placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted dark:hover:border-gray-500 resize-none" placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Create Department</Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Edit Modal */}
      <Modal isOpen={showScheduleEdit} onClose={() => { setShowScheduleEdit(false); setEditingDept(null); }} title={`Schedule — ${editingDept?.name || ''}`}>
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-mid dark:text-gray-300">Bookable (online appointments)</label>
            <button type="button" onClick={() => setSchedForm({ ...schedForm, isBookable: !schedForm.isBookable })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${schedForm.isBookable ? 'bg-emerald' : 'bg-slate-muted/30'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${schedForm.isBookable ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={schedForm.startTime} onChange={(e) => setSchedForm({ ...schedForm, startTime: e.target.value })} required />
            <Input label="End Time" type="time" value={schedForm.endTime} onChange={(e) => setSchedForm({ ...schedForm, endTime: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Break Start" type="time" value={schedForm.breakStart} onChange={(e) => setSchedForm({ ...schedForm, breakStart: e.target.value })} required />
            <Input label="Break End" type="time" value={schedForm.breakEnd} onChange={(e) => setSchedForm({ ...schedForm, breakEnd: e.target.value })} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">Slot Duration (minutes)</label>
            <select
              className="w-full rounded-xl border border-border dark:border-white/[0.08] bg-white dark:bg-gray-900 px-4 py-3 text-sm text-obsidian dark:text-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted"
              value={schedForm.slotDurationMinutes}
              onChange={(e) => setSchedForm({ ...schedForm, slotDurationMinutes: parseInt(e.target.value) })}
            >
              {[10, 15, 20, 25, 30, 45, 50, 60].map(m => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
          </div>

          {schedForm.isBookable && (
            <div className="rounded-xl bg-emerald/5 dark:bg-emerald/10 border border-emerald/20 dark:border-emerald/30 p-3">
              <p className="text-xs font-medium text-emerald-deep dark:text-emerald-light">
                {(() => {
                  const [sh, sm] = schedForm.startTime.split(':').map(Number);
                  const [eh, em] = schedForm.endTime.split(':').map(Number);
                  const [bs] = schedForm.breakStart.split(':').map(Number);
                  const [be] = schedForm.breakEnd.split(':').map(Number);
                  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
                  const breakMin = (be * 60) - (bs * 60);
                  const slots = Math.floor((totalMin - breakMin) / schedForm.slotDurationMinutes);
                  return `${slots} appointment slots per day (${schedForm.slotDurationMinutes} min each, ${breakMin} min break)`;
                })()}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowScheduleEdit(false); setEditingDept(null); }}>Cancel</Button>
            <Button type="submit" isLoading={savingSched}>Save Schedule</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
