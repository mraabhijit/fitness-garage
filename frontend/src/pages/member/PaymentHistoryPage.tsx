import React, { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { memberService } from '../../services/memberService';
import { Payment } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { CreditCard, Download, Calendar, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';

export const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    async function loadPayments() {
      setIsLoading(true);
      try {
        const res = await memberService.getMyPayments(page, pageSize);
        setPayments(res.data || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Error loading payment history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPayments();
  }, [page]);

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      setDownloadingId(paymentId);
      const { download_url } = await memberService.getInvoiceUrl(paymentId);
      window.open(download_url, '_blank');
    } catch {
      alert('Could not generate invoice download link. Please contact reception.');
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garage-mid/60 pb-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
            PAYMENT <span className="text-garage-chrome">/</span> HISTORY
          </h1>
          <p className="text-xs text-garage-muted font-body mt-1">
            Complete transaction ledger and downloadable tax invoices for all memberships.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-garage-dark border border-garage-mid text-xs font-semibold text-garage-muted">
          <Receipt className="w-4 h-4 text-garage-chrome" />
          <span>Total Transactions: <strong className="text-garage-white">{total}</strong></span>
        </div>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="my-24" />
      ) : payments.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <CreditCard className="w-12 h-12 text-garage-muted mx-auto opacity-50" />
          <h3 className="text-lg font-display uppercase tracking-wider text-garage-white">
            No Transactions Found
          </h3>
          <p className="text-xs text-garage-muted font-body max-w-sm mx-auto">
            Payment records and PDF receipts will be listed here as soon as staff logs your transactions.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View (>= 768px) */}
          <Card className="hidden md:block overflow-hidden p-0 border-garage-mid">
            <table className="w-full text-left text-sm">
              <thead className="bg-garage-black/60 text-xs uppercase tracking-wider text-garage-muted border-b border-garage-mid">
                <tr>
                  <th className="py-4 px-6 font-bold">Transaction Date</th>
                  <th className="py-4 px-6 font-bold">Plan Details</th>
                  <th className="py-4 px-6 font-bold">Amount Paid</th>
                  <th className="py-4 px-6 font-bold">Payment Method</th>
                  <th className="py-4 px-6 font-bold text-right">Invoice Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garage-mid/40 font-body">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-garage-mid/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-garage-white">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="py-4 px-6 text-garage-muted text-xs">
                      {p.notes || 'Gym Membership'}
                    </td>
                    <td className="py-4 px-6 font-bold text-garage-chrome">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-1 rounded bg-garage-black border border-garage-mid text-xs uppercase text-garage-muted font-semibold">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {p.invoice_path ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          isLoading={downloadingId === p.id}
                          onClick={() => handleDownloadInvoice(p.id)}
                          leftIcon={<Download className="w-3.5 h-3.5 text-garage-chrome" />}
                        >
                          Invoice PDF
                        </Button>
                      ) : (
                        <span className="text-xs text-garage-muted italic">Processing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile Card List (< 768px) */}
          <div className="md:hidden space-y-4">
            {payments.map((p) => (
              <Card key={p.id} className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-garage-mid/50 pb-3">
                  <div className="flex items-center gap-2 text-xs text-garage-muted">
                    <Calendar className="w-4 h-4 text-garage-chrome" />
                    <span>{formatDate(p.payment_date)}</span>
                  </div>
                  <span className="font-bold text-lg text-garage-chrome">
                    {formatCurrency(p.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-garage-muted">Method:</span>
                  <span className="uppercase font-semibold text-garage-white">
                    {p.payment_method}
                  </span>
                </div>

                {p.notes && (
                  <div className="text-xs text-garage-muted">
                    <span className="block text-[11px] text-garage-muted/70 uppercase">Note:</span>
                    <span>{p.notes}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-garage-mid/40">
                  {p.invoice_path ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      isLoading={downloadingId === p.id}
                      onClick={() => handleDownloadInvoice(p.id)}
                      leftIcon={<Download className="w-3.5 h-3.5 text-garage-chrome" />}
                    >
                      Download Invoice PDF
                    </Button>
                  ) : (
                    <div className="text-center text-xs text-garage-muted italic">
                      Invoice PDF Processing
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-garage-mid/60 text-xs text-garage-muted">
              <span>
                Page <strong className="text-garage-white">{page}</strong> of <strong className="text-garage-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
