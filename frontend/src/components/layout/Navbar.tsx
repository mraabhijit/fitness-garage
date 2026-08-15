import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, User, LogOut } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const navLinks = [
    { label: 'Home', path: ROUTES.HOME },
    { label: 'About', path: ROUTES.ABOUT },
    { label: 'Services', path: ROUTES.SERVICES },
    { label: 'Plans', path: ROUTES.PLANS },
    { label: 'Trainers', path: ROUTES.TRAINERS },
    { label: 'Gallery', path: ROUTES.GALLERY },
    { label: 'Reviews', path: ROUTES.TESTIMONIALS },
    { label: 'Contact', path: ROUTES.CONTACT },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-garage-black/90 backdrop-blur-md border-b border-garage-mid/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-garage-chrome flex items-center justify-center font-display text-garage-black font-extrabold text-2xl group-hover:bg-garage-chrome-dim transition-colors">
              FG
            </div>
            <span className="font-display text-2xl tracking-wider uppercase text-garage-white group-hover:text-garage-chrome transition-colors">
              FITNESS <span className="text-garage-chrome">/</span> GARAGE
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-garage-chrome ${
                  isActive(link.path) ? 'text-garage-chrome border-b-2 border-garage-chrome pb-1' : 'text-garage-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User / CTA actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === 'admin' || user?.role === 'dev' ? (
                  <Link to={ROUTES.ADMIN_DASHBOARD}>
                    <Button variant="secondary" size="sm" leftIcon={<Shield className="w-4 h-4 text-garage-chrome" />}>
                      Admin
                    </Button>
                  </Link>
                ) : (
                  <Link to={ROUTES.MEMBER_DASHBOARD}>
                    <Button variant="secondary" size="sm" leftIcon={<User className="w-4 h-4 text-garage-chrome" />}>
                      Portal
                    </Button>
                  </Link>
                )}
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-md text-garage-muted hover:text-status-expired hover:bg-garage-dark transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to={ROUTES.MEMBER_LOGIN}>
                  <Button variant="ghost" size="sm">
                    Member Login
                  </Button>
                </Link>
                <Link to={ROUTES.CONTACT}>
                  <Button variant="primary" size="sm">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-garage-white hover:text-garage-chrome hover:bg-garage-dark focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-garage-dark border-b border-garage-mid px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-semibold uppercase tracking-wider ${
                isActive(link.path)
                  ? 'text-garage-chrome bg-garage-mid/50'
                  : 'text-garage-muted hover:text-garage-white hover:bg-garage-mid/30'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-garage-mid/60 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'admin' || user?.role === 'dev' ? ROUTES.ADMIN_DASHBOARD : ROUTES.MEMBER_DASHBOARD}
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="primary" size="md" className="w-full">
                    {user?.role === 'admin' || user?.role === 'dev' ? 'Admin Dashboard' : 'Member Dashboard'}
                  </Button>
                </Link>
                <Button variant="outline" size="md" onClick={() => { logout(); setIsOpen(false); }} className="w-full">
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to={ROUTES.MEMBER_LOGIN} onClick={() => setIsOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Member Login
                  </Button>
                </Link>
                <Link to={ROUTES.CONTACT} onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
