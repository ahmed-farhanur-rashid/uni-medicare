'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') || '';
  const { toast } = useToast();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(
    token ? 'verifying' : 'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        const msg =
          err?.response?.data?.message || 'Verification failed. The link may be expired or already used.';
        setErrorMsg(msg);
        setStatus('error');
      });
  }, [token]);

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await authApi.resendVerification(email);
      setResent(true);
      toast('Verification email resent. Check your inbox.', 'success');
    } catch {
      setResent(true);
      toast('Failed to resend verification email.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cream-warm dark:bg-gray-950">
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
          <p className="text-silver/60 dark:text-gray-500/60 text-sm">University Medical Center Management System</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-obsidian dark:text-gray-100 font-display mb-2">Verifying your email...</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-obsidian dark:text-gray-100 font-display mb-2">Email verified!</h2>
              <p className="text-sm text-slate-muted dark:text-gray-500 mb-6">Your email has been verified. You can now sign in.</p>
              <Link href="/">
                <Button className="w-full">Sign in</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-rose/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-obsidian dark:text-gray-100 font-display mb-2">Verification failed</h2>
              <p className="text-sm text-slate-muted dark:text-gray-500 mb-6">{errorMsg}</p>
              <Link href="/">
                <Button variant="outline" className="w-full">Back to Sign in</Button>
              </Link>
            </>
          )}

          {status === 'idle' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-obsidian dark:text-gray-100 font-display mb-2">Check your email</h2>
              <p className="text-sm text-slate-muted dark:text-gray-500 mb-6">
                We&apos;ve sent a verification link to<br />
                <span className="font-medium text-obsidian dark:text-gray-100">{email || 'your email address'}</span>
              </p>

              <p className="text-sm text-slate-muted dark:text-gray-500 mb-8">
                Click the link in the email to verify your account. If you haven&apos;t received it, check your spam folder or resend below.
              </p>

              {resent ? (
                <div className="mb-6 p-3 rounded-xl bg-emerald/10 border border-emerald/20 text-sm text-emerald-deep">
                  Verification email resent. Check your inbox.
                </div>
              ) : (
                <Button onClick={handleResend} isLoading={resendLoading} variant="outline" className="mb-6">
                  Resend verification email
                </Button>
              )}

              <div>
                <Link href="/" className="text-sm text-emerald-deep font-medium hover:underline">
                  Back to Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream-warm dark:bg-gray-950">
        <div className="text-sm text-slate-muted dark:text-gray-500">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
