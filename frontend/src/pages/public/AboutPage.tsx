import React from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Card } from '../../components/common/Card'
import { StatBlock } from '../../components/common/StatBlock'
import { Award, Shield, Target, Zap } from 'lucide-react'

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <SectionHeading
        badge="Our Legacy"
        title="THE STORY / OF THE GARAGE"
        subtitle="Born out of the relentless desire for an uncompromised, raw, and high-performance training ground."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6 text-garage-muted font-body leading-relaxed text-base md:text-lg">
          <p>
            Fitness Garage was founded with a single mission: to eliminate commercial gym fluff and
            deliver an authentic, industrial-grade iron sanctum where progress is the only currency
            that matters.
          </p>
          <p>
            Every dumbbell, barbell, and custom machine in our facility has been selected with
            biomechanical precision to ensure safe, maximal hypertrophic and strength stimulation.
          </p>
          <p>
            Whether you are stepping under a barbell for the first time or prepping for a national
            powerlifting meet, our coaches and community hold you to the standard you deserve.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <StatBlock value="12+" label="Years In Business" />
          <StatBlock value="500+" label="Members Transformed" />
          <StatBlock value="15000" label="Sq Ft Iron Ground" />
          <StatBlock value="100%" label="Iron Dedication" />
        </div>
      </div>

      <SectionHeading
        badge="Core Values"
        title="BUILT ON / PRINCIPLES"
        subtitle="The iron rules we live by every single day."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <Shield className="w-8 h-8 text-garage-chrome mb-4" />
          <h4 className="text-xl font-display uppercase tracking-wider text-garage-white mb-2">
            No Compromise
          </h4>
          <p className="text-sm text-garage-muted font-body">
            Calibrated plates, competition power bars, and zero gimmicks.
          </p>
        </Card>

        <Card className="p-6">
          <Target className="w-8 h-8 text-garage-chrome mb-4" />
          <h4 className="text-xl font-display uppercase tracking-wider text-garage-white mb-2">
            Evidence-Based
          </h4>
          <p className="text-sm text-garage-muted font-body">
            Periodized training methodologies backed by sports science and biomechanics.
          </p>
        </Card>

        <Card className="p-6">
          <Award className="w-8 h-8 text-garage-chrome mb-4" />
          <h4 className="text-xl font-display uppercase tracking-wider text-garage-white mb-2">
            Elite Coaching
          </h4>
          <p className="text-sm text-garage-muted font-body">
            Every coach on the floor holds accredited certifications and real platform experience.
          </p>
        </Card>

        <Card className="p-6">
          <Zap className="w-8 h-8 text-garage-chrome mb-4" />
          <h4 className="text-xl font-display uppercase tracking-wider text-garage-white mb-2">
            Brotherhood
          </h4>
          <p className="text-sm text-garage-muted font-body">
            An encouraging yet fiercely competitive culture where we lift each other up.
          </p>
        </Card>
      </div>
    </div>
  )
}
