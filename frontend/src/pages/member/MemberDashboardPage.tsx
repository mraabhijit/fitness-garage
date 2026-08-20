import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { memberService } from '../../services/memberService'
import type { Member, Payment } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  Download,
  Dumbbell,
  ShieldCheck,
  User,
} from 'lucide-react'

export const MemberDashboardPage: React.FC = () => {
  const [member, setMember] = useState<Member | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, paymentsRes] = await Promise.all([
          memberService.getMyProfile().catch(() => null),
          memberService.getMyPayments(1, 5).catch(() => ({ data: [] })),
        ])
        if (profile) setMember(profile)
        setPayments(paymentsRes.data || [])
      } catch (err) {
        console.error('Error loading member dashboard', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      setDownloadingId(paymentId)
      const { download_url } = await memberService.getInvoiceUrl(paymentId)
      window.open(download_url, '_blank')
    } catch {
      alert('Could not generate invoice download URL. Please contact reception.')
    } finally {
      setDownloadingId(null)
    }
  }

  if (isLoading) return <Spinner size="lg" className="my-24" />

  const calculateDaysRemaining = (d?: string) =>
    d ? Math.ceil((new Date(d).getTime() - Date.now()) / 864e5) : 0

  const daysRemaining = calculateDaysRemaining(member?.expiry_date)
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 14
  const isExpired = daysRemaining <= 0 || member?.status === 'expired'

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-garage-mid/60 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center text-garage-chrome">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
              WELCOME BACK, {member?.full_name?.split(' ')[0] || 'ATHLETE'}
            </h1>
            <p className="text-xs text-garage-muted font-body">
              Member ID:{' '}
              <span className="font-mono text-garage-white">
                {member?.id?.slice(0, 8) || 'N/A'}
              </span>
            </p>
          </div>
        </div>

        <Badge
          status={member?.status || (isExpired ? 'expired' : 'active')}
          className="self-start md:self-auto py-1 px-3 text-sm font-bold uppercase"
        />
      </div>

      {/* 14-Day Warning Alert */}
      {isExpiringSoon && (
        <div className="p-4 rounded-xl bg-status-pending/10 border border-status-pending/40 flex items-start justify-between gap-4 text-status-pending">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm font-display uppercase tracking-wider">
                Renewal Notice: {daysRemaining} Days Remaining
              </h4>
              <p className="text-xs mt-1 text-garage-white/90 font-body">
                Your subscription expires on {formatDate(member?.expiry_date)}. Visit reception to
                renew.
              </p>
            </div>
          </div>
          <Link to={ROUTES.MEMBER_MEMBERSHIP} className="shrink-0 hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              className="border-status-pending text-status-pending hover:bg-status-pending/20"
            >
              View Plan
            </Button>
          </Link>
        </div>
      )}

      {/* Expired Alert */}
      {isExpired && (
        <div className="p-4 rounded-xl bg-status-expired/10 border border-status-expired/40 flex items-start justify-between gap-4 text-status-expired">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm font-display uppercase tracking-wider">
                Pass Expired
              </h4>
              <p className="text-xs mt-1 text-garage-white/90 font-body">
                Your membership expired on {formatDate(member?.expiry_date)}. Please renew at front
                desk.
              </p>
            </div>
          </div>
          <Link to={ROUTES.MEMBER_MEMBERSHIP} className="shrink-0 hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              className="border-status-expired text-status-expired hover:bg-status-expired/20"
            >
              Renewal Info
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-garage-chrome">
            <Dumbbell className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-garage-muted">
              Subscribed Tier
            </h4>
          </div>
          <p className="text-2xl font-display text-garage-white uppercase">
            {member?.plan
              ? `${member.plan.tier.toUpperCase()} (${member.plan.duration})`
              : 'Standard Pass'}
          </p>
          <div className="mt-4 pt-3 border-t border-garage-mid/40">
            <Link
              to={ROUTES.MEMBER_MEMBERSHIP}
              className="text-xs text-garage-chrome hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View full plan specs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-garage-chrome">
            <Calendar className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-garage-muted">
              Expiry Date
            </h4>
          </div>
          <p className="text-2xl font-display text-garage-white">
            {formatDate(member?.expiry_date)}
          </p>
          <div className="mt-4 pt-3 border-t border-garage-mid/40 flex items-center gap-1.5 text-xs text-garage-muted">
            <Clock className="w-3.5 h-3.5 text-garage-chrome" />
            <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-garage-chrome">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-garage-muted">
              Floor Access
            </h4>
          </div>
          <p className="text-2xl font-display text-status-active uppercase">
            {member?.status === 'active' ? 'Authorized' : 'Action Required'}
          </p>
          <div className="mt-4 pt-3 border-t border-garage-mid/40 text-xs text-garage-muted">
            RFID / QR gate pass active
          </div>
        </Card>
      </div>

      {/* Recent Payments Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-garage-mid">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-garage-chrome" />
            <h3 className="text-xl font-display uppercase tracking-wider text-garage-white">
              Recent Transactions
            </h3>
          </div>
          <Link
            to={ROUTES.MEMBER_PAYMENTS}
            className="text-xs text-garage-chrome hover:underline font-semibold flex items-center gap-1"
          >
            <span>All Payments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8 text-garage-muted text-sm font-body">
            No payment records found. Official invoices will appear here once logged by gym staff.
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
              <tbody className="divide-y divide-garage-mid/40 font-body">
                {payments.slice(0, 3).map((p) => (
                  <tr key={p.id} className="hover:bg-garage-mid/20 transition-colors">
                    <td className="py-3 font-medium text-garage-white">
                      {formatDate(p.payment_date)}
                    </td>
                    <td className="py-3 font-bold text-garage-chrome">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 uppercase text-xs text-garage-muted">{p.payment_method}</td>
                    <td className="py-3 text-right">
                      {p.invoice_path ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={downloadingId === p.id}
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
  )
}
