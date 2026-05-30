'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { vitalsApi } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function NurseVitalsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [consultId, setConsultId] = useState('');
  const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', respiratoryRate: '', oxygenSaturation: '', bloodGlucose: '', weight: '', height: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultId) return;
    setSaving(true);
    try {
      await vitalsApi.create(parseInt(consultId, 10), {
        bp: vitals.bp,
        pulse: parseInt(vitals.pulse) || 0,
        temp: parseFloat(vitals.temp) || 0,
        respiratoryRate: parseInt(vitals.respiratoryRate) || 0,
        oxygenSaturation: parseFloat(vitals.oxygenSaturation) || 0,
        bloodGlucose: parseFloat(vitals.bloodGlucose) || 0,
        weight: parseFloat(vitals.weight) || 0,
        height: parseFloat(vitals.height) || 0,
      });
      setSuccess(true);
      setVitals({ bp: '', pulse: '', temp: '', respiratoryRate: '', oxygenSaturation: '', bloodGlucose: '', weight: '', height: '' });
      setConsultId('');
      setTimeout(() => setSuccess(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  if (!isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Record Vitals" description="Record patient vital signs for a consultation." />

      {success && (
        <div className="p-4 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald-deep text-sm animate-scale-in">
          Vitals recorded successfully.
        </div>
      )}

      <Card className="animate-fade-in-up opacity-0 stagger-1">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Consultation ID" type="number" placeholder="Enter consultation ID" value={consultId} onChange={(e) => setConsultId(e.target.value)} required />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Blood Pressure" placeholder="e.g. 120/80" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} />
              <Input label="Pulse (bpm)" type="number" placeholder="e.g. 72" value={vitals.pulse} onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })} />
              <Input label="Temperature (°F)" type="number" step="0.1" placeholder="e.g. 98.6" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} />
              <Input label="Respiratory Rate" type="number" placeholder="e.g. 16" value={vitals.respiratoryRate} onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })} />
              <Input label="O₂ Saturation (%)" type="number" step="0.1" placeholder="e.g. 98" value={vitals.oxygenSaturation} onChange={(e) => setVitals({ ...vitals, oxygenSaturation: e.target.value })} />
              <Input label="Blood Glucose (mg/dL)" type="number" step="0.1" placeholder="e.g. 95" value={vitals.bloodGlucose} onChange={(e) => setVitals({ ...vitals, bloodGlucose: e.target.value })} />
              <Input label="Weight (kg)" type="number" step="0.1" placeholder="e.g. 70" value={vitals.weight} onChange={(e) => setVitals({ ...vitals, weight: e.target.value })} />
              <Input label="Height (cm)" type="number" step="0.1" placeholder="e.g. 175" value={vitals.height} onChange={(e) => setVitals({ ...vitals, height: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" isLoading={saving}>Record Vitals</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
