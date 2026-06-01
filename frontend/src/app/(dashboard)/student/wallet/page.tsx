'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { walletApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function StudentWalletPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [balance, setBalance] = useState<number | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    walletApi.getBalance()
      .then((res) => setBalance(res.data.balance))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) return;
    const callbackUrl = `${window.location.origin}/student/wallet/topup/callback`;
    window.location.href = `/merchant/topup?amount=${amount}&callback=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="View your balance and top up your account."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Card */}
        <Card className="animate-fade-in-up opacity-0 stagger-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-slate-muted dark:text-gray-400">Current Balance</p>
                <p className="text-3xl font-bold text-obsidian dark:text-gray-100 font-display tracking-tight mt-1">
                  {loading ? '—' : balance !== null ? formatCurrency(balance) : '—'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald/10 text-emerald-deep">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cream-warm dark:bg-white/[0.02] border border-gray-200 dark:border-[#1e2737]">
              <p className="text-xs font-medium text-slate-muted dark:text-gray-500 mb-2">Quick Top Up</p>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(String(amt))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      topUpAmount === String(amt)
                        ? 'bg-emerald text-white shadow-sm'
                        : 'bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-400 border border-gray-200 dark:border-[#1e2737] hover:border-emerald hover:text-emerald'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#1e2737] bg-white dark:bg-gray-900 text-obsidian dark:text-gray-100 placeholder:text-silver dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
                />
                <Button
                  onClick={handleTopUp}
                  disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                >
                  Top Up
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="animate-fade-in-up opacity-0 stagger-2">
          <CardHeader>
            <h3 className="font-semibold text-obsidian dark:text-gray-100 font-display">How It Works</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Enter Amount', desc: 'Choose or type the amount you want to add to your wallet.' },
                { step: '2', title: 'Payment Gateway', desc: 'You will be redirected to our secure payment partner.' },
                { step: '3', title: 'Confirm Payment', desc: 'Enter your card details and complete the payment.' },
                { step: '4', title: 'Balance Updated', desc: 'Your wallet balance is updated instantly after payment.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald/10 text-emerald-deep flex items-center justify-center text-xs font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-obsidian dark:text-gray-100">{item.title}</p>
                    <p className="text-xs text-slate-muted dark:text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
