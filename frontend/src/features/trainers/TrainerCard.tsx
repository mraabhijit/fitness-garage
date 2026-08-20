import React, { useState } from 'react'
import { Award, Briefcase } from 'lucide-react'
import type { Trainer } from '../../types'
import { Card } from '../../components/common/Card'
import { buildAssetUrl } from '../../utils/buildAssetUrl'

export interface TrainerCardProps {
  trainer: Trainer
}

export const TrainerCard: React.FC<TrainerCardProps> = ({ trainer }) => {
  const [expanded, setExpanded] = useState(false)
  const photoUrl = trainer.photo_filename
    ? buildAssetUrl('trainers', trainer.photo_filename)
    : trainer.photo_url || null

  return (
    <Card hoverEffect className="overflow-hidden flex flex-col justify-between group">
      <div>
        <div className="relative h-72 w-full bg-garage-dark overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={trainer.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-garage-muted bg-garage-mid/20 font-display text-4xl">
              {trainer.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-garage-dark via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="p-6">
          <div className="inline-block px-3 py-1 rounded-full bg-garage-chrome/10 border border-garage-chrome/30 text-garage-chrome text-xs font-bold uppercase tracking-wider mb-2">
            {trainer.specialization}
          </div>
          <h3 className="text-2xl font-display uppercase tracking-wider text-garage-white mb-2">
            {trainer.name}
          </h3>

          <div className="flex items-center gap-4 text-xs text-garage-muted font-semibold mb-4">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-garage-chrome" />
              {trainer.experience_years}+ Years Exp
            </span>
            {trainer.certifications && trainer.certifications.length > 0 && (
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-garage-chrome" />
                {trainer.certifications[0]}
              </span>
            )}
          </div>

          <p
            onClick={() => {
              setExpanded(!expanded)
            }}
            className={`text-garage-muted text-sm font-body leading-relaxed cursor-pointer ${
              expanded ? '' : 'line-clamp-3'
            }`}
          >
            {trainer.bio || 'Dedicated strength coach committed to your athletic progression.'}
          </p>
        </div>
      </div>
    </Card>
  )
}
