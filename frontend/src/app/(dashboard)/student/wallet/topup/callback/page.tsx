'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { walletApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const amount = searchParams.get('amount');
    if (!amount || !isAuthenticated) return;

    const processTopUp = async () => {
      try {
        const res = await walletApi.topUp(parseFloat(amount));
        setBalance(res.data.balance);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };

    processTopUp();
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => router.push('/student/wallet'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {status === 'processing' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Processing Payment</h1>
            <p className="text-sm text-slate-500">Please wait while we confirm your top-up...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Payment Successful!</h1>
            <p className="text-sm text-slate-500 mb-4">Your wallet has been topped up.</p>
            {balance !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
                <span className="text-sm text-emerald-700">New Balance:</span>
                <span className="text-lg font-bold text-emerald-800">{formatCurrency(balance)}</span>
              </div>
            )}
            <p className="text-xs text-slate-400">Redirecting to wallet in 3 seconds...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Payment Failed</h1>
            <p className="text-sm text-slate-500 mb-4">Something went wrong processing your top-up.</p>
            <button
              onClick={() => router.push('/student/wallet')}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium transition-colors"
            >
              Back to Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalletTopUpCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
