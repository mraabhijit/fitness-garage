import React, { useState } from 'react'
import type { Service } from '../../types'
import { Card } from '../../components/common/Card'
import { buildAssetUrl } from '../../utils/buildAssetUrl'
import {
  Activity,
  Dumbbell,
  Flame,
  HeartPulse,
  Move,
  Music,
  Scale,
  Shield,
  Smile,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface ServiceCardProps {
  service: Service
  index?: number
}

const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  'personal-training': Dumbbell,
  'strength-conditioning': Flame,
  'bodybuilding-hypertrophy': Activity,
  'hiit-cardio': Zap,
  'functional-fitness': Shield,
  'nutrition-consultation': Scale,
  'weight-loss-transformation': Sparkles,
  'recovery-mobility': HeartPulse,
  zumba: Music,
  'kids-dancing': Smile,
  'kids-dance': Smile,
  'sports-mobility': Move,
}

const DEFAULT_ICONS: LucideIcon[] = [
  Dumbbell,
  Flame,
  Activity,
  Zap,
  Shield,
  Scale,
  Sparkles,
  HeartPulse,
]

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, index = 0 }) => {
  const [imageError, setImageError] = useState(false)
  const FallbackIcon = SERVICE_ICON_MAP[service.slug] || DEFAULT_ICONS[index % DEFAULT_ICONS.length]

  const iconUrl =
    !imageError && service.icon_filename ? buildAssetUrl('services', service.icon_filename) : null

  return (
    <Card hoverEffect className="p-8 flex flex-col justify-between group">
      <div>
        <div className="w-14 h-14 rounded-2xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center text-garage-chrome mb-6 group-hover:scale-110 transition-transform">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={service.name}
              className="w-7 h-7 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <FallbackIcon className="w-7 h-7" />
          )}
        </div>
        <h3 className="text-2xl font-display uppercase tracking-wider text-garage-white mb-3">
          {service.name}
        </h3>
        <p className="text-garage-muted text-sm leading-relaxed font-body">{service.description}</p>
      </div>
    </Card>
  )
}
