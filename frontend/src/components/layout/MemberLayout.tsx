import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { CreditCard, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/authStore'

export const MemberLayout: React.FC = () => {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const tabs = [
    { label: 'Dashboard', path: ROUTES.MEMBER_DASHBOARD, icon: LayoutDashboard },
    { label: 'Membership', path: ROUTES.MEMBER_MEMBERSHIP, icon: ShieldCheck },
    { label: 'Payments & Invoices', path: ROUTES.MEMBER_PAYMENTS, icon: CreditCard },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex flex-col min-h-screen bg-garage-black text-garage-white">
      {/* Top Slim Header */}
      <header className="sticky top-0 z-40 bg-garage-dark/95 backdrop-blur-md border-b border-garage-mid/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo & Portal Label */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-garage-chrome flex items-center justify-center font-display text-garage-black font-extrabold text-lg">
              FG
            </div>
            <span className="font-display text-xl tracking-wider uppercase text-garage-white group-hover:text-garage-chrome transition-colors">
              FITNESS <span className="text-garage-chrome">/</span> GARAGE
            </span>
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-widest text-garage-muted px-2 py-0.5 rounded bg-garage-mid/40 border border-garage-mid ml-2">
              Member Portal
            </span>
          </Link>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-garage-muted">
              <User className="w-4 h-4 text-garage-chrome" />
              <span className="text-garage-white font-semibold">{user?.email || 'Member'}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-garage-muted hover:text-status-expired hover:bg-garage-mid/40 transition-colors border border-transparent hover:border-status-expired/30"
              title="Logout from portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-garage-mid/40 bg-garage-black/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex space-x-1 sm:space-x-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = isActive(tab.path)
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                    active
                      ? 'border-garage-chrome text-garage-chrome font-bold'
                      : 'border-transparent text-garage-muted hover:text-garage-white hover:border-garage-mid'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-garage-mid/40 py-6 text-center text-xs text-garage-muted font-body">
        <p>
          © {new Date().getFullYear()} Fitness Garage. Need assistance? Contact reception at +91
          98765 43210
        </p>
      </footer>
    </div>
  )
}
