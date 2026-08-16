import React, { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { memberService } from '../../services/memberService';
import { Member, Payment } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { User, Calendar, CreditCard, Download, ShieldCheck, Dumbbell } from 'lucide-react';

export const MemberDashboardPage: React.FC = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, paymentsRes] = await Promise.all([
          memberService.getMyProfile().catch(() => null),
          memberService.getMyPayments(1, 5).catch(() => ({ data: [] })),
        ]);
        if (profile) setMember(profile);
        setPayments(paymentsRes.data || []);
      } catch (err) {
        console.error('Error loading member dashboard', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const { download_url } = await memberService.getInvoiceUrl(paymentId);
      window.open(download_url, '_blank');
    } catch (e) {
      alert('Could not generate invoice download URL. Please try again.');
    }
  };

  if (isLoading) return <Spinner size="lg" className="my-24" />;

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-garage-mid pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center text-garage-chrome">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
              WELCOME BACK, {member?.full_name?.split(' ')[0] || 'ATHLETE'}
            </h1>
            <p className="text-xs text-garage-muted font-body">
              Member ID: <span className="font-mono text-garage-white">{member?.id?.slice(0, 8) || 'N/A'}</span>
            </p>
          </div>
        </div>

        <Badge status={member?.status || 'active'} className="self-start md:self-auto py-1 px-3 text-sm font-bold uppercase" />
      </div>

      {/* Membership Card Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-garage-chrome">
            <Dumbbell className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-garage-muted">Active Plan</h4>
          </div>
          <p className="text-2xl font-display text-garage-white uppercase">
            {member?.plan ? `${member.plan.tier.toUpperCase()} (${member.plan.duration})` : 'Standard Membership'}
          </p>
          <p className="text-xs text-garage-muted mt-1">
            {member?.plan?.description || 'Full floor access with coaching.'}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-garage-chrome">
            <Calendar className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-garage-muted">Membership Expiry</h4>
          </div>
          <p className="text-2xl font-display text-garage-white">
            {formatDate(member?.expiry_date)}
          </p>
          <p className="text-xs text-garage-muted mt-1">
            Started: {formatDate(member?.start_date)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-garage-chrome">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-garage-muted">Access Status</h4>
          </div>
          <p className="text-2xl font-display text-status-active uppercase">
            {member?.status === 'active' ? 'Authorized' : 'Renewal Needed'}
          </p>
          <p className="text-xs text-garage-muted mt-1">
            RFID / QR Gate pass synced
          </p>
        </Card>
      </div>

      {/* Payment History Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-garage-mid">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-garage-chrome" />
            <h3 className="text-xl font-display uppercase tracking-wider text-garage-white">
              Payment & Invoice Receipts
            </h3>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8 text-garage-muted text-sm font-body">
            No payment history recorded yet. Invoices will automatically appear here once logged by staff.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-garage-muted border-b border-garage-mid">
                <tr>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Method</th>
                  <th className="pb-3 font-bold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garage-mid/40">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-garage-mid/20 transition-colors">
                    <td className="py-3 font-medium text-garage-white">{formatDate(p.payment_date)}</td>
                    <td className="py-3 font-bold text-garage-chrome">{formatCurrency(p.amount)}</td>
                    <td className="py-3 uppercase text-xs text-garage-muted">{p.payment_method}</td>
                    <td className="py-3 text-right">
                      {p.invoice_path ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(p.id)}
                          leftIcon={<Download className="w-3.5 h-3.5 text-garage-chrome" />}
                        >
                          PDF
                        </Button>
                      ) : (
                        <span className="text-xs text-garage-muted">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
