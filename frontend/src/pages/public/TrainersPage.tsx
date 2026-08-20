import React, { useEffect, useState } from 'react'
import { SectionHeading } from '../../components/common/SectionHeading'
import { Spinner } from '../../components/common/Spinner'
import { TrainerCard } from '../../features/trainers/TrainerCard'
import { publicService } from '../../services/publicService'
import type { Trainer } from '../../types'
import { buildAssetUrl } from '../../utils/buildAssetUrl'

export const TrainersPage: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    publicService
      .getTrainers()
      .then(setTrainers)
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const trainersSchema =
    trainers.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Fitness Garage Trainers',
          itemListElement: trainers.map((trainer, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Person',
              name: trainer.name,
              jobTitle: 'Personal Trainer',
              worksFor: { '@type': 'GymOrSportsClub', name: 'Fitness Garage' },
              knowsAbout: [trainer.specialization],
              image:
                trainer.photo_url ||
                (trainer.photo_filename
                  ? buildAssetUrl('trainers', trainer.photo_filename)
                  : undefined),
            },
          })),
        }
      : null

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {trainersSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(trainersSchema) }}
        />
      )}
      <SectionHeading
        badge="THE CADRE"
        title="MASTER / COACHES"
        subtitle="Elite certified coaches dedicated to scientific progression, biomechanics, and relentless accountability."
        align="center"
      />

      {isLoading ? (
        <Spinner size="lg" className="my-20" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  )
}
