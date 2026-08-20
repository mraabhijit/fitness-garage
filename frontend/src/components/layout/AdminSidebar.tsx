import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Award,
  ChevronLeft,
  CreditCard,
  Dumbbell,
  Image,
  Layers,
  LayoutDashboard,
  LogOut,
  Sliders,
  Star,
  UserCheck,
  Users,
} from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../store/authStore'

export const AdminSidebar: React.FC = () => {
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)

  const menuItems = [
    { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { label: 'Members', path: ROUTES.ADMIN_MEMBERS, icon: Users },
    { label: 'Payments', path: ROUTES.ADMIN_PAYMENTS, icon: CreditCard },
    { label: 'Plans', path: ROUTES.ADMIN_PLANS, icon: Layers },
    { label: 'Services', path: ROUTES.ADMIN_SERVICES, icon: Dumbbell },
    { label: 'Trainers', path: ROUTES.ADMIN_TRAINERS, icon: UserCheck },
    { label: 'Gallery', path: ROUTES.ADMIN_GALLERY, icon: Image },
    { label: 'Achievements', path: ROUTES.ADMIN_STATS, icon: Award },
    { label: 'Reviews', path: ROUTES.TESTIMONIALS, icon: Star },
    { label: 'Site Settings', path: ROUTES.ADMIN_SETTINGS, icon: Sliders },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="w-64 bg-garage-dark border-r border-garage-mid min-h-screen flex flex-col justify-between shrink-0">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-garage-mid">
          <Link to={ROUTES.HOME} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-garage-chrome flex items-center justify-center font-display text-garage-black font-extrabold text-xl">
              FG
            </div>
            <div>
              <span className="font-display text-lg tracking-wider uppercase text-garage-white block">
                ADMIN <span className="text-garage-chrome">/</span> PLANE
              </span>
              <span className="text-[10px] uppercase font-bold text-garage-muted tracking-widest block">
                Fitness Garage
              </span>
            </div>
          </Link>
        </div>

        {/* Nav list */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-garage-chrome text-garage-black font-bold shadow-md shadow-garage-chrome/10'
                    : 'text-garage-muted hover:text-garage-white hover:bg-garage-mid/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${active ? 'text-garage-black' : 'text-garage-chrome'}`}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-garage-mid space-y-2">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-garage-muted hover:text-garage-white hover:bg-garage-mid/30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          View Public Site
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-status-expired hover:bg-status-expired/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  )
}
