import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { publicService } from './services/publicService'
import { useSiteConfigStore } from './store/siteConfigStore'

export const App: React.FC = () => {
  const setConfigs = useSiteConfigStore((s) => s.setConfigs)

  useEffect(() => {
    async function loadSiteConfig() {
      try {
        const configs = await publicService.getSiteConfig()
        if (configs) {
          setConfigs(configs)
        }
      } catch (err) {
        console.warn('Initial site config fetch deferred (using defaults):', err)
      }
    }
    loadSiteConfig()
  }, [setConfigs])

  return <RouterProvider router={router} />
}

export default App
