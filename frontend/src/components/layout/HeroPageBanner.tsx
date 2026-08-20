import React from 'react'
import { SectionHeading } from '../common/SectionHeading'

export interface HeroPageBannerProps {
  title: string
  subtitle?: string
  badge?: string
}

export const HeroPageBanner: React.FC<HeroPageBannerProps> = ({
  title,
  subtitle,
  badge,
}) => {
  return (
    <div className="relative bg-garage-dark border-b border-garage-mid py-16 md:py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-garage-mid/20 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <SectionHeading
          badge={badge}
          title={title}
          subtitle={subtitle}
          align="center"
        />
      </div>
    </div>
  )
}
