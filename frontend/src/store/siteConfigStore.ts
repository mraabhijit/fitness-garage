import { create } from 'zustand'

interface SiteConfigState {
  configs: Record<string, string>
  isLoading: boolean
  setConfigs: (configs: Record<string, string>) => void
  getConfig: (key: string, fallback?: string) => string
}

export const useSiteConfigStore = create<SiteConfigState>((set, get) => ({
  configs: {},
  isLoading: false,

  setConfigs: (configs: Record<string, string>) => {
    set({ configs, isLoading: false })
  },

  getConfig: (key: string, fallback = '') => {
    return get().configs[key] ?? fallback
  },
}))
