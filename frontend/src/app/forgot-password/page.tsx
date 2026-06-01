'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api';
import { forgotPasswordSchema } from '@/lib/validations';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.forgotPassword(data.email);
      setSuccess('If an account exists with that email, you will receive a password reset link shortly.');
    } catch {
      setSuccess('If an account exists with that email, you will receive a password reset link shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cream-warm">
      <div className="hidden lg:flex lg:w-1/2 bg-obsidian relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 mesh-gradient-dark opacity-60" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-emerald/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white font-display mb-3">Uni Medicare</h1>
          <p className="text-silver/60 text-sm">University Medical Center Management System</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-obsidian font-display">Forgot your password?</h2>
            <p className="text-sm text-slate-muted mt-1">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose/10 border border-rose/20 text-sm text-rose">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald/10 border border-emerald/20 text-sm text-emerald-deep">{success}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@student.edu"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" isLoading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-muted">
            Remember your password?{' '}
            <Link href="/" className="text-emerald-deep font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
