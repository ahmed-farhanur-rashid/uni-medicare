'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { billingApi, type InvoiceResponse } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export default function ReceptionistBillingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/'); return; }

    async function loadInvoices() {
      try {
        const res = await billingApi.getMyInvoices();
        setInvoices(res.data);
      } catch {} finally { setLoading(false); }
    }
    loadInvoices();
  }, [isAuthenticated, router]);

  const handlePay = async (invoiceId: number) => {
    try {
      await billingApi.pay(invoiceId);
      loadInvoices();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Manage patient invoices and payments." />

      {loading ? <TableSkeleton rows={4} cols={4} /> : invoices.length === 0 ? (
        <Card><EmptyState icon={<svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>} title="No invoices" description="No invoices have been created yet." /></Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv, i) => (
            <Card key={inv.invoiceId} hover className={`animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 8)}`}>
              <CardContent className="p-0">
                <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-cream-warm/50 transition-colors" onClick={() => setExpandedId(expandedId === inv.invoiceId ? null : inv.invoiceId)}>
                  <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-obsidian">Invoice #{inv.invoiceId}</p>
                      <StatusBadge status={inv.transactionStatus} />
                    </div>
                    <p className="text-sm text-slate-muted mt-0.5">{inv.studentName} · {formatDate(inv.invoiceDate)}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <p className="text-lg font-bold text-obsidian font-display">{formatCurrency(inv.totalAmount)}</p>
                    {inv.transactionStatus === 'pending' && (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handlePay(inv.invoiceId); }}>Pay</Button>
                    )}
                  </div>
                </div>
                {expandedId === inv.invoiceId && (
                  <div className="border-t border-border/40">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border/30"><th className="text-left px-5 py-2.5 font-medium text-slate-muted">Service</th><th className="text-left px-5 py-2.5 font-medium text-slate-muted hidden sm:table-cell">Description</th><th className="text-center px-5 py-2.5 font-medium text-slate-muted">Qty</th><th className="text-right px-5 py-2.5 font-medium text-slate-muted">Total</th></tr></thead>
                      <tbody className="divide-y divide-border/30">
                        {inv.lineItems.map((item) => (
                          <tr key={item.lineItemId} className="hover:bg-cream-warm/30">
                            <td className="px-5 py-3 font-medium text-obsidian">{item.serviceName}</td>
                            <td className="px-5 py-3 text-slate-muted hidden sm:table-cell">{item.description}</td>
                            <td className="px-5 py-3 text-center text-slate-muted">{item.quantity}</td>
                            <td className="px-5 py-3 text-right font-medium text-obsidian">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
