import type { MembershipStatus } from '../types'

export interface StatusBadgeConfig {
  label: string
  badgeClass: string
  dotClass: string
}

const STATUS_MAP: Record<string, StatusBadgeConfig> = {
  active: {
    label: 'Active',
    badgeClass: 'bg-status-active/10 text-status-active border-status-active/30',
    dotClass: 'bg-status-active',
  },
  expired: {
    label: 'Expired',
    badgeClass: 'bg-status-expired/10 text-status-expired border-status-expired/30',
    dotClass: 'bg-status-expired',
  },
  pending: {
    label: 'Pending',
    badgeClass: 'bg-status-pending/10 text-status-pending border-status-pending/30',
    dotClass: 'bg-status-pending',
  },
  suspended: {
    label: 'Suspended',
    badgeClass: 'bg-garage-mid text-garage-muted border-garage-mid',
    dotClass: 'bg-garage-muted',
  },
}

export function getMembershipStatusConfig(status: MembershipStatus | string): StatusBadgeConfig {
  return (
    STATUS_MAP[status.toLowerCase()] ?? {
      label: status,
      badgeClass: 'bg-garage-dark text-garage-white border-garage-mid',
      dotClass: 'bg-garage-white',
    }
  )
}
