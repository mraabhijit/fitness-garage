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
    async function load() {
      try {
        const data = await publicService.getTrainers();
        setTrainers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <SectionHeading
        badge="Coaching Staff"
        title="MASTER / TRAINERS"
        subtitle="Every coach on our roster holds certified credentials, deep platform experience, and an obsession with technique."
      />

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <Card key={trainer.id} hoverEffect className="overflow-hidden flex flex-col">
              {/* Photo Area */}
              <div className="h-64 bg-garage-mid/40 flex items-center justify-center relative overflow-hidden">
                {trainer.photo_url ? (
                  <img
                    src={trainer.photo_url}
                    alt={trainer.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <User className="w-20 h-20 text-garage-muted/40" />
                )}
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-garage-black/80 backdrop-blur-sm rounded border border-garage-mid text-xs font-bold uppercase text-garage-chrome">
                  {trainer.experience_years}+ Years Experience
                </div>
              </div>

              {/* Bio Details */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-display uppercase tracking-wider text-garage-white mb-1">
                    {trainer.name}
                  </h3>
                  <p className="text-sm font-semibold text-garage-chrome uppercase tracking-wider mb-4">
                    {trainer.specialization}
                  </p>
                  <p className="text-sm text-garage-muted font-body mb-6 leading-relaxed">
                    {trainer.bio || 'Dedicated to sculpting high-performance athletic ability and physique transformations.'}
                  </p>
                </div>

                {trainer.certifications && trainer.certifications.length > 0 && (
                  <div className="pt-4 border-t border-garage-mid/50">
                    <div className="flex items-center gap-1.5 text-xs text-garage-muted mb-2 font-bold uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-garage-chrome" />
                      <span>Certifications</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trainer.certifications.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-garage-black border border-garage-mid text-[11px] text-garage-white"
                        >
                          {c}
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
