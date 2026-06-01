'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi, type ProfileResponse } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }
    authApi.getProfile()
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (loading) return <TableSkeleton rows={3} cols={2} />;
  if (!profile) return null;

  const roleLabel = profile.role.charAt(0) + profile.role.slice(1).toLowerCase().replace(/_/g, ' ');

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="View your account details." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar name={profile.name || profile.role} size="xl" />
            <h2 className="mt-4 text-lg font-bold text-obsidian">{profile.name}</h2>
            <p className="text-sm text-slate-muted">{roleLabel}</p>
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
            <h3 className="text-sm font-semibold text-obsidian mb-4">Account Information</h3>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="py-2 border-b border-border/30">
      <p className="text-xs text-slate-muted">{label}</p>
      <p className={`text-sm mt-0.5 ${highlight ? 'text-rose font-medium' : 'text-obsidian'}`}>{value}</p>
    </div>
  );
}
