import React from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { MembershipPlan } from '../../types'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { formatCurrency } from '../../utils/formatters'
import { ROUTES } from '../../constants/routes'

export interface PlanCardProps {
  plan: MembershipPlan
  featured?: boolean
}

const DURATION_MONTHS: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  annual: 12,
}

const DURATION_LABELS: Record<string, string> = {
  monthly: '1 Month',
  quarterly: '3 Months',
  half_yearly: '6 Months',
  annual: '12 Months',
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, featured = false }) => {
  const isPt = plan.tier === 'pt' || featured
  const priceDisplay =
    plan.price && plan.price > 0 ? formatCurrency(plan.price) : 'Contact for pricing'

  const months = DURATION_MONTHS[plan.duration] || 1
  const monthlyEquivalent =
    plan.price && plan.price > 0 && months > 1
      ? `(${formatCurrency(Math.round(plan.price / months))}/mo)`
      : null

  const features =
    plan.features && plan.features.length > 0
      ? plan.features
      : plan.tier === 'pt'
        ? [
            'All General Floor & Locker Access',
            'Dedicated 1-on-1 Certified Coach',
            'Custom Workout & Periodized Split',
            'Personalized Macro & Nutrition Plan',
          ]
        : [
            'Unrestricted Gym Floor Access',
            'Free Weights & Competition Racks',
            'Locker Room & Shower Facilities',
          ]

  return (
    <Card
      variant={isPt ? 'chrome' : 'default'}
      hoverEffect
      className="p-8 flex flex-col justify-between relative group border-garage-mid/60 hover:border-garage-chrome/50 transition-all"
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <span
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              isPt
                ? 'bg-garage-chrome text-garage-black'
                : 'bg-garage-mid text-garage-white'
            }`}
          >
            {plan.tier === 'pt' ? 'Personal Coaching' : 'Standard'}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-garage-muted">
            {DURATION_LABELS[plan.duration] || plan.duration.replace('_', ' ')}
          </span>
        </div>

        <div className="mb-2">
          <span className="text-4xl font-display font-extrabold text-garage-chrome">
            {priceDisplay}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-6 min-h-[22px]">
          {monthlyEquivalent && (
            <span className="text-xs text-garage-muted font-body">
              {monthlyEquivalent}
            </span>
          )}
          {plan.badge && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-garage-chrome/15 text-garage-chrome border border-garage-chrome/30">
              {plan.badge}
            </span>
          )}
        </div>

        <p className="text-sm text-garage-muted mb-6 font-body">
          {plan.description}
        </p>

        <ul className="space-y-3 mb-8 text-sm text-garage-muted font-body">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-garage-white/90">
              <Check className="w-4 h-4 text-garage-chrome shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link to={ROUTES.CONTACT} className="w-full">
        <Button
          variant={isPt ? 'primary' : 'outline'}
          size="md"
          className="w-full"
        >
          Enquire Now
        </Button>
      </Link>
    </Card>
  )
}
