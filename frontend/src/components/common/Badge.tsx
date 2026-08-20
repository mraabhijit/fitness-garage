import React from 'react'
import type { MembershipStatus } from '../../types'
import { getMembershipStatusConfig } from '../../utils/status'

export interface BadgeProps {
  children?: React.ReactNode
  status?: MembershipStatus | string
  variant?: 'active' | 'expired' | 'pending' | 'suspended' | 'default'
  className?: string
  withDot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  variant,
  className = '',
  withDot = true,
}) => {
  if (status) {
    const config = getMembershipStatusConfig(status)
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass} ${className}`}
      >
        {withDot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dotClass}`} />}
        {children || config.label}
      </span>
    )
  }

  const variants = {
    active: 'bg-status-active/10 text-status-active border-status-active/30',
    expired: 'bg-status-expired/10 text-status-expired border-status-expired/30',
    pending: 'bg-status-pending/10 text-status-pending border-status-pending/30',
    suspended: 'bg-garage-mid text-garage-muted border-garage-mid',
    default: 'bg-garage-dark text-garage-white border-garage-mid',
  }

  const selectedVariant = variant || 'default'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[selectedVariant]} ${className}`}
    >
      {children}
    </span>
  )
}
