import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Flame, Star } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { publicService } from '../../services/publicService';
import { Achievement, MembershipPlan, Review, Service } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SectionHeading } from '../../components/common/SectionHeading';
import { StatBlock } from '../../components/common/StatBlock';
import { formatCurrency } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesRes, plansRes, reviewsRes, achRes] = await Promise.all([
          publicService.getServices(),
          publicService.getPlans(),
          publicService.getReviews(),
          publicService.getAchievements(),
        ]);
        setServices(servicesRes.slice(0, 4));
        setPlans(plansRes.slice(0, 4));
        setReviews(reviewsRes.slice(0, 3));
        setAchievements(achRes);
      } catch (err) {
        console.error('Error fetching homepage data', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-garage-black overflow-hidden px-4">
        {/* Background gradient grid effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-garage-dark via-garage-black to-black opacity-80" />

        <div className="relative z-10 max-w-5xl mx-auto text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-garage-chrome/10 border border-garage-chrome/30 text-garage-chrome text-xs font-bold uppercase tracking-widest mb-8">
            <Flame className="w-4 h-4 text-garage-chrome" />
            <span>Forge Your Ultimate Physique</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight text-garage-white leading-none mb-6">
            PUSH <span className="text-garage-chrome">/</span> BEYOND LIMITS
          </h1>

          <p className="text-lg md:text-xl text-garage-muted max-w-2xl mx-auto font-body mb-10 leading-relaxed">
            Welcome to Fitness Garage — an elite dark industrial strength arena equipped with competition-grade iron, certified coaching, and proven transformation blueprints.
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

      {/* 2. STATS / ACHIEVEMENTS BAR */}
      <section className="bg-garage-dark border-y border-garage-mid py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {achievements.length > 0 ? (
            achievements.map((ach) => (
              <StatBlock key={ach.id} value={ach.value || '100+'} label={ach.label} />
            ))
          ) : (
            <>
              <StatBlock value="500+" label="Active Athletes" />
              <StatBlock value="12+" label="Years of Grit" />
              <StatBlock value="8" label="Certified Coaches" />
              <StatBlock value="100%" label="Transformation Rate" />
            </>
          )}
        </div>
      </section>

      {/* 3. SERVICES HIGHLIGHT */}
      <section className="py-24 px-4 bg-garage-black">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            badge="Programs & Amenities"
            title="ENGINEERED / FOR PERFORMANCE"
            subtitle="Explore high-octane training environments curated for powerlifters, bodybuilders, and fitness purists."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.id} variant="default" hoverEffect className="p-6">
                <div className="w-12 h-12 rounded-lg bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center text-garage-chrome mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display uppercase tracking-wider text-garage-white mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-garage-muted font-body leading-relaxed">
                  {service.description || 'State-of-the-art equipment designed for maximum muscle engagement.'}
                </p>
              </Card>
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
              <Card
                key={plan.id}
                variant={plan.tier === 'pt' ? 'chrome' : 'default'}
                hoverEffect
                className="p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-garage-mid text-garage-white">
                      {plan.tier.toUpperCase()}
                    </span>
                    <span className="text-xs text-garage-muted uppercase">{plan.duration}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-display text-garage-chrome font-extrabold mb-4">
                    {formatCurrency(plan.price)}
                  </div>
                  <p className="text-xs text-garage-muted font-body mb-6">
                    {plan.description || 'Full unrestricted gym access with free locker facilities and coaching support.'}
                  </p>
                </div>

                <Link to={ROUTES.CONTACT} className="w-full">
                  <Button variant={plan.tier === 'pt' ? 'primary' : 'outline'} size="sm" className="w-full">
                    Enroll Now
                  </Button>
                </Link>
              </Card>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} variant="default" className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-garage-chrome text-garage-chrome" />
                  ))}
                </div>
                <p className="text-sm text-garage-muted italic mb-6 font-body">
                  "{review.review_text || 'Incredible gym aesthetic, top-tier trainers, and a serious lifting atmosphere!'}"
                </p>
                <div className="flex items-center justify-between border-t border-garage-mid/50 pt-4 text-xs">
                  <span className="font-bold text-garage-white uppercase">{review.reviewer_name}</span>
                  <span className="text-garage-muted">Verified Google Review</span>
                </div>
              </Card>
            ))}
          </div>
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
  );
};
