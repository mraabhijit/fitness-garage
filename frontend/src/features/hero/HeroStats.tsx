import React from 'react'
import type { HeroStat } from '../../types'
import { StatBlock } from '../../components/common/StatBlock'

export interface HeroStatsProps {
  stats: HeroStat[]
}

export const HeroStats: React.FC<HeroStatsProps> = ({ stats }) => {
  if (!stats || stats.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <StatBlock key={idx} value={stat.value} label={stat.label} />
      ))}
    </div>
  )
}
