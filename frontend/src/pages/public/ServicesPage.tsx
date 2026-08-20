import React, { useEffect, useState } from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Spinner } from '../../components/common/Spinner'
import { ServiceCard } from '../../features/services/ServiceCard'
import { publicService } from '../../services/publicService'
import type { Service } from '../../types'

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
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
