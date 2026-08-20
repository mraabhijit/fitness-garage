import React from 'react'
import type { Service } from '../../types'
import { Card } from '../../components/common/Card'
import { buildAssetUrl } from '../../utils/buildAssetUrl'
import { Dumbbell } from 'lucide-react'

export interface ServiceCardProps {
  service: Service
  index?: number
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, index = 0 }) => {
  const iconUrl = service.icon_filename
    ? buildAssetUrl('services', service.icon_filename)
    : null

  return (
    <Card hoverEffect className="p-8 flex flex-col justify-between group">
      <div>
        <div className="w-14 h-14 rounded-2xl bg-garage-chrome/10 border border-garage-chrome/30 flex items-center justify-center text-garage-chrome mb-6 group-hover:scale-110 transition-transform">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={service.name}
              className="w-7 h-7 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <Dumbbell className="w-7 h-7" />
          )}
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
}
