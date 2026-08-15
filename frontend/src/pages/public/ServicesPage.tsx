import React, { useEffect, useState } from 'react';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { publicService } from '../../services/publicService';
import { Service } from '../../types';
import { Dumbbell, Flame, HeartPulse, Activity, Zap, Shield, Sparkles, Scale } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await publicService.getServices();
        setServices(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const getIcon = (index: number) => {
    const icons = [Dumbbell, Flame, HeartPulse, Activity, Zap, Shield, Sparkles, Scale];
    const IconComp = icons[index % icons.length];
    return <IconComp className="w-8 h-8 text-garage-chrome" />;
  };

  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <SectionHeading
        badge="What We Offer"
        title="TRAINING / DISCIPLINES"
        subtitle="Custom programs built for athletic power, hyper-focused hypertrophy, and functional longevity."
      />

      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, idx) => (
            <Card key={svc.id} hoverEffect className="p-8 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center mb-6">
                  {getIcon(idx)}
                </div>
                <h3 className="text-2xl font-display uppercase tracking-wider text-garage-white mb-3">
                  {svc.name}
                </h3>
                <p className="text-sm text-garage-muted font-body leading-relaxed">
                  {svc.description || 'Comprehensive programming customized to your bio-mechanics and performance goals.'}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-garage-mid/50 flex items-center text-xs font-bold uppercase tracking-wider text-garage-chrome">
                <span>Certified Equipment Included</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
