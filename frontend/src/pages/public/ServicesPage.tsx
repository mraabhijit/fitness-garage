import React, { useEffect, useState } from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Card } from '../../components/common/Card'
import { Spinner } from '../../components/common/Spinner'
import { publicService } from '../../services/publicService'
import type { Service } from '../../types'
import { Activity, Dumbbell, Flame, HeartPulse, Scale, Shield, Sparkles, Zap } from 'lucide-react'

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    publicService
      .getServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const icons = [Dumbbell, Flame, HeartPulse, Activity, Zap, Shield, Sparkles, Scale]

  const servicesSchema =
    services.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Fitness Garage Services',
          itemListElement: services.map((svc, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Service',
              name: svc.name,
              description: svc.description || 'Specialized fitness programming at Fitness Garage.',
              provider: { '@type': 'GymOrSportsClub', name: 'Fitness Garage' },
            },
          })),
        }
      : null

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {servicesSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
        />
      )}
      <SectionHeading
        badge="PROGRAMS"
        title="BUILT / FOR RESULTS"
        subtitle="Comprehensive physical preparation tailored to strength, conditioning, and longevity."
        align="center"
      />

      {isLoading ? (
        <Spinner size="lg" className="my-20" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {services.map((service, index) => {
            const Icon = icons[index % icons.length]
            return (
              <Card key={service.id} hoverEffect className="p-8 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center text-garage-chrome mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-display uppercase tracking-wider text-garage-white mb-3">
                    {service.name}
                  </h3>
                  <p className="text-garage-muted text-sm leading-relaxed font-body">
                    {service.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-garage-mid/40 flex items-center justify-between text-xs text-garage-chrome uppercase tracking-wider font-semibold">
                  <span>Elite Protocol</span>
                  <span className="text-garage-muted">FG-{String(index + 1).padStart(2, '0')}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
