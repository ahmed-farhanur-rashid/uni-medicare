'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import Button from '@/components/ui/Button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.resendVerification(email);
      setResent(true);
    } catch {
      setResent(true);
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white font-display mb-3">Uni Medicare</h1>
          <p className="text-silver/60 text-sm">University Medical Center Management System</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-obsidian font-display mb-2">Check your email</h2>
          <p className="text-sm text-slate-muted mb-6">
            We&apos;ve sent a verification link to<br />
            <span className="font-medium text-obsidian">{email || 'your email address'}</span>
          </p>

          <p className="text-sm text-slate-muted mb-8">
            Click the link in the email to verify your account. If you haven&apos;t received it, check your spam folder or resend below.
          </p>

          {resent ? (
            <div className="mb-6 p-3 rounded-xl bg-emerald/10 border border-emerald/20 text-sm text-emerald-deep">
              Verification email resent. Check your inbox.
            </div>
          ) : (
            <Button onClick={handleResend} isLoading={loading} variant="outline" className="mb-6">
              Resend verification email
            </Button>
          )}

          <div>
            <Link href="/" className="text-sm text-emerald-deep font-medium hover:underline">
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream-warm">
        <div className="text-sm text-slate-muted">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
