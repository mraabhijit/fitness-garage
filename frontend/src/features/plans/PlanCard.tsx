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

export const PlanCard: React.FC<PlanCardProps> = ({ plan, featured = false }) => {
  const isPt = plan.tier === 'pt' || featured
  const priceDisplay =
    plan.price && plan.price > 0 ? formatCurrency(plan.price) : 'Contact for pricing'

  return (
    <Card
      variant={isPt ? 'chrome' : 'default'}
      hoverEffect
      className="p-8 flex flex-col justify-between"
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
            {plan.duration.replace('_', ' ')}
          </span>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-display font-extrabold text-garage-chrome">
            {priceDisplay}
          </span>
        </div>

        <p className="text-sm text-garage-muted mb-6 font-body">
          {plan.description ||
            (plan.tier === 'pt'
              ? 'Comprehensive personal coaching and custom nutrition programming.'
              : 'Full floor access, cardio theater, and locker amenities.')}
        </p>

        <ul className="space-y-3 mb-8 text-sm text-garage-muted font-body">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-garage-chrome shrink-0" />
            <span>Unrestricted Gym Floor Access</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-garage-chrome shrink-0" />
            <span>Locker Room & Shower Facilities</span>
          </li>
          {plan.tier === 'pt' && (
            <>
              <li className="flex items-center gap-2 text-garage-white font-medium">
                <Check className="w-4 h-4 text-garage-chrome shrink-0" />
                <span>Dedicated 1-on-1 Master Coach</span>
              </li>
              <li className="flex items-center gap-2 text-garage-white font-medium">
                <Check className="w-4 h-4 text-garage-chrome shrink-0" />
                <span>Custom Macro & Diet Programming</span>
              </li>
            </>
          )}
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
