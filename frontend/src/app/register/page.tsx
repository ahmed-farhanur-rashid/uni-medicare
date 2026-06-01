'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api';
import { z } from 'zod';
import { registerSchema } from '@/lib/validations';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setLoading(true);

    try {
      await authApi.register({
        studentId: parseInt(data.studentId),
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        bloodgroup: data.bloodgroup || undefined,
        sex: data.sex || undefined,
      });
      router.push(`/verify-email?email=${encodeURIComponent(data.email ?? '')}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cream-warm">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-obsidian relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 mesh-gradient-dark opacity-60" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-emerald/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white font-display mb-3">Uni Medicare</h1>
          <p className="text-silver/60 text-sm">University Medical Center Management System</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-obsidian font-display">Create your account</h2>
            <p className="text-sm text-slate-muted mt-1">Register as a student to access medical services</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose/10 border border-rose/20 text-sm text-rose">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Student ID"
              type="number"
              placeholder="e.g. 2021021"
              error={errors.studentId?.message}
              {...register('studentId')}
            />
            <Input
              label="Full Name"
              placeholder="Your full name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@student.edu"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone"
              placeholder="01XXXXXXXXX"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <div>
              <label className="block text-sm font-medium text-slate-mid mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm text-obsidian placeholder:text-silver transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted ${errors.password ? 'border-rose focus:ring-rose/30 focus:border-rose' : 'border-border'}`}
                  placeholder="Min 8 characters"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-slate-muted transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>
            <Input
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-mid mb-1.5">Blood Group</label>
                <select
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-obsidian transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted ${errors.bloodgroup ? 'border-rose focus:ring-rose/30 focus:border-rose' : 'border-border'}`}
                  {...register('bloodgroup')}
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-mid mb-1.5">Sex</label>
                <select
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-obsidian transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald hover:border-slate-muted ${errors.sex ? 'border-rose focus:ring-rose/30 focus:border-rose' : 'border-border'}`}
                  {...register('sex')}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-muted">
            Already have an account?{' '}
            <Link href="/" className="text-emerald-deep font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
