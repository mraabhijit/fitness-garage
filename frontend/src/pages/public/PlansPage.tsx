import React, { useEffect, useState } from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Spinner } from '../../components/common/Spinner'
import { PlanCard } from '../../features/plans/PlanCard'
import { publicService } from '../../services/publicService'
import type { MembershipPlan } from '../../types'

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
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}
