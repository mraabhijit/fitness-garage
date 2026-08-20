import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { ROUTES } from '../../constants/routes'
import { publicService } from '../../services/publicService'
import type { MembershipPlan } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { Check } from 'lucide-react'

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [selectedTier, setSelectedTier] = useState<'all' | 'basic' | 'pt'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await publicService.getPlans()
        setPlans(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filteredPlans = plans.filter((p) => {
    if (selectedTier === 'all') return true
    return p.tier === selectedTier
  })

  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <SectionHeading
        badge="Transparent Pricing"
        title="MEMBERSHIP / PLANS"
        subtitle="Zero admission fees. Zero annual surprise maintenance charges. Choose the tier that drives your ambition."
      />

      {/* Tier Filter Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex p-1 bg-garage-dark border border-garage-mid rounded-xl">
          <button
            onClick={() => {
              setSelectedTier('all')
            }}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedTier === 'all'
                ? 'bg-garage-chrome text-garage-black'
                : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            All Plans
          </button>
          <button
            onClick={() => {
              setSelectedTier('basic')
            }}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedTier === 'basic'
                ? 'bg-garage-chrome text-garage-black'
                : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            General Access
          </button>
          <button
            onClick={() => {
              setSelectedTier('pt')
            }}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedTier === 'pt'
                ? 'bg-garage-chrome text-garage-black'
                : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            Personal Training (PT)
          </button>
        </div>
      </div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredPlans.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.tier === 'pt' ? 'chrome' : 'default'}
              hoverEffect
              className="p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span
                    className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      plan.tier === 'pt'
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
                    {formatCurrency(plan.price)}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 text-sm text-garage-muted font-body">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-garage-chrome shrink-0" />
                    <span>Unrestricted Gym Floor Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-garage-chrome shrink-0" />
                    <span>Locker Room & Shower Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-garage-chrome shrink-0" />
                    <span>Digital Membership Portal</span>
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
                  variant={plan.tier === 'pt' ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  Join on {plan.duration.replace('_', ' ')}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
