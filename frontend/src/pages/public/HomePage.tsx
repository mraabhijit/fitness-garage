import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { publicService } from '../../services/publicService'
import type { HeroData, MembershipPlan, Service } from '../../types'
import { Button } from '../../components/common/Button'
import { SectionHeading } from '../../components/common/SectionHeading'
import { HeroSlideshow } from '../../features/hero/HeroSlideshow'
import { HeroStats } from '../../features/hero/HeroStats'
import { ServiceCard } from '../../features/services/ServiceCard'
import { PlanCard } from '../../features/plans/PlanCard'
import { GoogleReviews } from '../../features/reviews/GoogleReviews'

export const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [heroData, setHeroData] = useState<HeroData | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, plansRes, heroRes] = await Promise.all([
          publicService.getServices(),
          publicService.getPlans(),
          publicService.getHeroData(),
        ])
        setServices(servicesRes.slice(0, 4))
        setPlans(plansRes.slice(0, 4))
        setHeroData(heroRes)
      } catch (err) {
        console.error('Error fetching homepage data', err)
      }
    }
    loadData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-garage-black overflow-hidden px-4">
        {heroData?.slides && (
          <HeroSlideshow
            slides={heroData.slides}
            intervalMs={heroData.slideshow_interval_ms}
          />
        )}

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-garage-dark via-garage-black to-black opacity-80" />

        <div className="relative z-10 max-w-5xl mx-auto text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-garage-chrome/10 border border-garage-chrome/30 text-garage-chrome text-xs font-bold uppercase tracking-widest mb-8">
            <Flame className="w-4 h-4 text-garage-chrome" />
            <span>Forge Your Ultimate Physique</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight text-garage-white leading-none mb-6">
            {heroData?.headline_before || 'PUSH'}{' '}
            <span className="text-garage-chrome">/</span>{' '}
            {heroData?.headline_after || 'BEYOND LIMITS'}
          </h1>

          <p className="text-lg md:text-xl text-garage-muted max-w-2xl mx-auto font-body mb-10 leading-relaxed">
            Welcome to Fitness Garage — an elite dark industrial strength arena equipped with
            competition-grade iron, certified coaching, and proven transformation blueprints.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={ROUTES.PLANS}>
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                View Membership Plans
              </Button>
            </Link>
            <Link to={ROUTES.CONTACT}>
              <Button variant="outline" size="lg">
                Book Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      {heroData?.stats && (
        <section className="bg-garage-dark border-y border-garage-mid py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <HeroStats stats={heroData.stats} />
          </div>
        </section>
      )}

      {/* 3. SERVICES HIGHLIGHT */}
      <section className="py-24 px-4 bg-garage-black">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Programs & Amenities"
            title="ENGINEERED / FOR PERFORMANCE"
            subtitle="Explore high-octane training environments curated for powerlifters, bodybuilders, and fitness purists."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <ServiceCard key={service.id} service={service} index={idx} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to={ROUTES.SERVICES}>
              <Button variant="secondary" size="md">
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PLANS HIGHLIGHT */}
      <section className="py-24 px-4 bg-[#191919] border-t border-garage-mid/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Simple Transparent Pricing"
            title="MEMBERSHIP / TIERS"
            subtitle="Straightforward plans with zero hidden maintenance fees or long-term lock-ins."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to={ROUTES.PLANS}>
              <Button variant="secondary" size="md">
                View Full Pricing Matrix
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. REVIEWS HIGHLIGHT */}
      <section className="py-24 px-4 bg-garage-black border-t border-garage-mid/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Verified Athletes"
            title="PROVEN / RESULTS"
            subtitle="Real member feedback synced live from Google Maps reviews."
          />

          <GoogleReviews limit={3} />
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="py-20 px-4 bg-garage-dark border-t border-garage-mid text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-display uppercase tracking-wider text-garage-white mb-4">
            READY TO JOIN / THE BROTHERHOOD?
          </h2>
          <p className="text-base text-garage-muted mb-8 font-body">
            Stop waiting for tomorrow. Drop in for a session or sign up online right now.
          </p>
          <Link to={ROUTES.CONTACT}>
            <Button variant="primary" size="lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
