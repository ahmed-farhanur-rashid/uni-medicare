'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi, type ProfileResponse } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    authApi.getProfile()
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const startEditing = () => {
    if (!profile) return;
    setEditForm({
      name: profile.name || '',
      phone: profile.phone || '',
      email: profile.email || '',
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updates: Record<string, string> = {};
      if (editForm.name !== profile?.name) updates.name = editForm.name;
      if (editForm.phone !== (profile?.phone || '')) updates.phone = editForm.phone;
      if (profile?.role === 'STUDENT' && editForm.email !== profile?.email) updates.email = editForm.email;

      if (Object.keys(updates).length === 0) {
        setEditing(false);
        return;
      }

      const res = await authApi.updateProfile(updates);
      setProfile({ ...profile!, ...res.data });
      setEditing(false);
      toast('Profile updated successfully', 'success');
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast('Password must be at least 8 characters', 'error');
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast('Password changed successfully', 'success');
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <TableSkeleton rows={3} cols={2} />;
  if (!profile) return null;

  const roleLabel = profile.role.charAt(0) + profile.role.slice(1).toLowerCase().replace(/_/g, ' ');
  const isStudent = profile.role === 'STUDENT';

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and edit your account details."
        actions={
          <div className="flex gap-2">
            {!editing && !changingPassword && (
              <>
                <Button variant="outline" onClick={startEditing}>Edit Profile</Button>
                <Button variant="outline" onClick={() => setChangingPassword(true)}>Change Password</Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar name={profile.name || profile.role} size="xl" />
            <h2 className="mt-4 text-lg font-bold text-obsidian dark:text-gray-100">{profile.name}</h2>
            <p className="text-sm text-slate-muted dark:text-gray-500">{roleLabel}</p>
            {profile.specialty && (
              <p className="text-xs text-emerald-deep mt-1 font-medium">{profile.specialty}</p>
            )}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                profile.isActive !== false
                  ? 'bg-emerald/10 text-emerald-deep'
                  : 'bg-rose/10 text-rose'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile.isActive !== false ? 'bg-emerald' : 'bg-rose'}`} />
                {profile.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-obsidian dark:text-gray-100 mb-4">
              {editing ? 'Edit Profile' : changingPassword ? 'Change Password' : 'Account Information'}
            </h3>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#1e2737] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#1e2737] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                {isStudent && (
                  <div>
                    <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#1e2737] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveProfile} disabled={saving} className="bg-emerald text-white">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : changingPassword ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#1e2737] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#1e2737] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-muted dark:text-gray-500 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#1e2737] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={changePassword} disabled={saving} className="bg-emerald text-white">
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button variant="outline" onClick={() => setChangingPassword(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Full Name" value={profile.name} />
                <InfoRow label="Role" value={roleLabel} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Phone" value={profile.phone || '—'} />
                {profile.department && <InfoRow label="Department" value={profile.department} />}
                {profile.specialty && <InfoRow label="Specialty" value={profile.specialty} />}
                {profile.issuedOn && <InfoRow label="Enrolled" value={profile.issuedOn} />}
                {profile.expiresOn && <InfoRow label="Expires" value={profile.expiresOn} />}
                {profile.emailVerified !== undefined && (
                  <InfoRow
                    label="Email Verified"
                    value={profile.emailVerified ? 'Yes' : 'No'}
                    highlight={!profile.emailVerified}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="py-2 border-b border-gray-200 dark:border-[#1e2737]">
      <p className="text-xs text-slate-muted dark:text-gray-500">{label}</p>
      <p className={`text-sm mt-0.5 ${highlight ? 'text-rose font-medium' : 'text-obsidian dark:text-gray-100'}`}>{value}</p>
    </div>
  );
}
