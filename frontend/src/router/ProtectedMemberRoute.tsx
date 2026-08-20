import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/authStore'

export const ProtectedMemberRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    ;(
      document.querySelector('meta[name="robots"]') ??
      document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'robots' }))
    ).setAttribute('content', 'noindex, nofollow')
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-garage-black">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-garage-chrome border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.MEMBER_LOGIN} replace />
  }

  return <Outlet />
}
