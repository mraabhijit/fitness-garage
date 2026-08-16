import React, { useEffect, useState } from 'react';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { publicService } from '../../services/publicService';
import { Trainer } from '../../types';
import { Award, User } from 'lucide-react';

export const TrainersPage: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    publicService.getTrainers()
      .then(setTrainers)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const trainersSchema = trainers.length > 0 ? {
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
        image: trainer.photo_url || undefined,
      },
    })),
  } : null;

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
            <Card key={trainer.id} hoverEffect className="overflow-hidden flex flex-col justify-between p-0">
              <div className="relative aspect-[4/5] bg-garage-dark overflow-hidden flex items-center justify-center">
                {trainer.photo_url ? (
                  <img
                    src={trainer.photo_url}
                    alt={trainer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-garage-mid">
                    <User className="w-20 h-20 mb-2 stroke-[1.5]" />
                    <span className="text-xs uppercase tracking-widest font-mono">Photo Pending</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-garage-black via-garage-black/20 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-xs font-bold text-garage-chrome uppercase tracking-widest">
                    {trainer.specialization}
                  </span>
                  <h3 className="text-3xl font-display uppercase tracking-wider text-garage-white mt-0.5">
                    {trainer.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-garage-muted font-body mt-1">
                    <span>{trainer.experience_years} Years Experience</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-garage-muted text-sm leading-relaxed font-body">
                  {trainer.bio || 'Dedicated to helping athletes unlock peak functional performance and strength.'}
                </p>

                {trainer.certifications && trainer.certifications.length > 0 && (
                  <div className="pt-3 border-t border-garage-mid/40">
                    <div className="flex items-center gap-1.5 text-xs text-garage-chrome mb-2 font-semibold uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5" />
                      <span>Certifications</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trainer.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-garage-black border border-garage-mid/60 text-[11px] text-garage-muted"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
