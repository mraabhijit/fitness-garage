import React, { useEffect, useState } from 'react'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { memberService } from '../../services/memberService'
import type { Member } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Dumbbell,
  Mail,
  PhoneCall,
} from 'lucide-react'
import { useSiteConfigStore } from '../../store/siteConfigStore'

export const MembershipStatusPage: React.FC = () => {
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const getConfig = useSiteConfigStore((s) => s.getConfig)

  const gymPhone = getConfig('gym_phone', '+91 98765 43210')
  const gymEmail = getConfig('gym_email', 'contact@fitnessgarage.com')

  useEffect(() => {
    async function load() {
      try {
        const profile = await memberService.getMyProfile()
        setMember(profile)
      } catch (err) {
        console.error('Error fetching membership status:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) return <Spinner size="lg" className="my-24" />

  // Calculate days remaining
  const calculateDaysRemaining = (d?: string) =>
    d ? Math.ceil((new Date(d).getTime() - Date.now()) / 864e5) : 0

  const daysRemaining = calculateDaysRemaining(member?.expiry_date)
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 14
  const isExpired = daysRemaining <= 0 || member?.status === 'expired'

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-garage-mid/60 pb-6">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
            MEMBERSHIP <span className="text-garage-chrome">/</span> STATUS
          </h1>
          <p className="text-xs text-garage-muted font-body mt-1">
            Active subscription credentials, renewal lifecycle, and tier privileges.
          </p>
        </div>
        <Badge
          status={member?.status || (isExpired ? 'expired' : 'active')}
          className="self-start sm:self-auto py-1 px-3 text-sm font-bold uppercase"
        />
      </div>

      {/* Expiry Warning Banner if <= 14 days */}
      {isExpiringSoon && (
        <div className="p-4 rounded-xl bg-status-pending/10 border border-status-pending/40 flex items-start gap-3 text-status-pending">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm font-display uppercase tracking-wider">
              Membership Expiring Soon ({daysRemaining} Days Left)
            </h4>
            <p className="text-xs mt-1 text-garage-white/90 font-body">
              Your gym pass will expire on{' '}
              <span className="font-semibold text-status-pending">
                {formatDate(member?.expiry_date)}
              </span>
              . Please renew at the front desk to avoid gate interruption.
            </p>
          </div>
        </div>
      )}

      {/* Expired Alert Banner */}
      {isExpired && (
        <div className="p-4 rounded-xl bg-status-expired/10 border border-status-expired/40 flex items-start gap-3 text-status-expired">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm font-display uppercase tracking-wider">
              Membership Expired
            </h4>
            <p className="text-xs mt-1 text-garage-white/90 font-body">
              Your subscription lapsed on {formatDate(member?.expiry_date)}. Please visit the gym
              reception to renew your pass.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Overview Card */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3 text-garage-chrome border-b border-garage-mid/50 pb-4">
            <Dumbbell className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-display uppercase tracking-wider text-garage-white">
                Current Package
              </h3>
              <p className="text-xs text-garage-muted font-body">Subscribed Tier Details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-garage-muted block">
                Tier &amp; Duration
              </span>
              <p className="text-2xl font-display uppercase text-garage-chrome tracking-wide">
                {member?.plan
                  ? `${member.plan.tier.toUpperCase()} — ${member.plan.duration}`
                  : 'General Fitness Pass'}
              </p>
            </div>

            {member?.plan?.price && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-garage-muted block">
                  Recurring Tariff
                </span>
                <p className="text-xl font-bold font-body text-garage-white">
                  {formatCurrency(member.plan.price)}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-garage-muted block">
                Package Inclusions
              </span>
              <p className="text-xs text-garage-muted mt-1 leading-relaxed">
                {member?.plan?.description ||
                  'Full unrestricted floor access, locker access, and coach assistance.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Timeline & Gate Status Card */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3 text-garage-chrome border-b border-garage-mid/50 pb-4">
            <Calendar className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-display uppercase tracking-wider text-garage-white">
                Validity Timeline
              </h3>
              <p className="text-xs text-garage-muted font-body">Start &amp; Renewal Dates</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-garage-muted block">
                  Commencement
                </span>
                <p className="text-sm font-semibold text-garage-white">
                  {formatDate(member?.start_date)}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-garage-muted block">
                  Expiration
                </span>
                <p className="text-sm font-semibold text-garage-chrome">
                  {formatDate(member?.expiry_date)}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-garage-muted block">
                Time Remaining
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-garage-chrome" />
                <span className="text-xl font-display text-garage-white">
                  {daysRemaining > 0 ? `${daysRemaining} Days Remaining` : 'Expired'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-garage-muted block">
                Facility Features
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-garage-muted">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-garage-chrome" />
                  <span>Free Weight Arena</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-garage-chrome" />
                  <span>Cardio Deck</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-garage-chrome" />
                  <span>Locker Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-garage-chrome" />
                  <span>Trainer Support</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Renewal CTA Card */}
      <Card className="p-6 bg-garage-mid/20 border border-garage-chrome/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xl font-display uppercase tracking-wider text-garage-white">
            Need to Renew or Upgrade Your Tier?
          </h4>
          <p className="text-xs text-garage-muted font-body">
            Speak directly with the Fitness Garage coaching staff at reception or reach out via
            email.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a href={`tel:${gymPhone}`} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              className="w-full"
            >
              Call Desk
            </Button>
          </a>
          <a href={`mailto:${gymEmail}`} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Mail className="w-4 h-4 text-garage-chrome" />}
              className="w-full"
            >
              Email Desk
            </Button>
          </a>
        </div>
      </Card>
    </div>
  )
}
