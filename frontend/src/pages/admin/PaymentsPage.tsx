import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { SelectField } from '../../components/forms/SelectField';
import { adminService } from '../../services/adminService';
import { Member, MembershipPlan, Payment } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Download, Plus } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [page] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    membership_plan_id: '',
    amount: 1500,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    notes: '',
    generate_invoice: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [paymentsRes, membersRes, plansRes] = await Promise.all([
        adminService.getPayments(page, 15),
        adminService.getMembers(1, 100).catch(() => ({ data: [] })),
        adminService.getPlans().catch(() => []),
      ]);
      setPayments(paymentsRes.data || []);
      setMembers(membersRes.data || []);
      setPlans(plansRes);
      if (membersRes.data && membersRes.data.length > 0 && !formData.member_id) {
        setFormData((prev) => ({ ...prev, member_id: membersRes.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.recordPayment({
        member_id: formData.member_id,
        membership_plan_id: formData.membership_plan_id || undefined,
        amount: Number(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        notes: formData.notes,
        generate_invoice: formData.generate_invoice,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      const { download_url } = await adminService.getInvoiceUrl(paymentId);
      window.open(download_url, '_blank');
    } catch {
      alert('Could not retrieve invoice download URL');
    }
  };

  return (
    <div className="flex min-h-screen bg-garage-black">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
              BILLING <span className="text-garage-chrome">/</span> PAYMENTS
            </h1>
            <p className="text-xs text-garage-muted font-body mt-1">
              Recorded revenue and automated ReportLab PDF invoices.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record Payment
          </Button>
        </div>

        <Card className="p-6">
          {isLoading ? (
            <Spinner size="lg" className="my-12" />
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-garage-muted">
              No payments recorded yet. Click "Record Payment" above to add a transaction.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-garage-muted border-b border-garage-mid">
                  <tr>
                    <th className="pb-3 font-bold">Athlete</th>
                    <th className="pb-3 font-bold">Amount</th>
                    <th className="pb-3 font-bold">Date</th>
                    <th className="pb-3 font-bold">Method</th>
                    <th className="pb-3 font-bold text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garage-mid/40">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-garage-mid/20 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-garage-white">{p.member_name || 'Member'}</div>
                        <div className="text-[11px] text-garage-muted font-mono">{p.member_id.slice(0, 8)}</div>
                      </td>
                      <td className="py-3.5 font-bold text-garage-chrome">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 text-xs text-garage-white">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="py-3.5 text-xs uppercase text-garage-muted">
                        {p.payment_method}
                      </td>
                      <td className="py-3.5 text-right">
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
                          <span className="text-xs text-garage-muted">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Record Payment Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Manual Payment"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <SelectField
              label="Select Member"
              required
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              options={members.map((m) => ({
                value: m.id,
                label: `${m.full_name} (${m.phone_number || m.email_address || m.id.slice(0, 6)})`,
              }))}
            />

            <SelectField
              label="Membership Plan"
              value={formData.membership_plan_id}
              onChange={(e) => {
                const planId = e.target.value;
                const p = plans.find((pl) => pl.id === planId);
                setFormData({
                  ...formData,
                  membership_plan_id: planId,
                  amount: p ? Number(p.price) : formData.amount,
                });
              }}
              options={[
                { value: '', label: 'Custom / Direct Payment' },
                ...plans.map((p) => ({
                  value: p.id,
                  label: `${p.tier.toUpperCase()} - ${p.duration} (₹${p.price})`,
                })),
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Amount (INR)"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
              <FormField
                label="Payment Date"
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>

            <SelectField
              label="Payment Method"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'upi', label: 'UPI / QR' },
                { value: 'card', label: 'Credit / Debit Card' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <FormField
              label="Payment Notes / Transaction ID"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-garage-mid">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Generate Invoice & Save
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
