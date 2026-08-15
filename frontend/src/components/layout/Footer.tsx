import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] border-t border-garage-mid/60 text-garage-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-garage-chrome flex items-center justify-center font-display text-garage-black font-extrabold text-2xl">
                FG
              </div>
              <span className="font-display text-2xl tracking-wider uppercase text-garage-white">
                FITNESS <span className="text-garage-chrome">/</span> GARAGE
              </span>
            </Link>
            <p className="text-sm text-garage-muted font-body leading-relaxed">
              Push beyond your limits. Fitness Garage is your premium dark industrial strength and transformation sanctum.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-garage-dark hover:bg-garage-chrome hover:text-garage-black text-garage-muted transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-garage-dark hover:bg-garage-chrome hover:text-garage-black text-garage-muted transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-garage-dark hover:bg-garage-chrome hover:text-garage-black text-garage-muted transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold font-display uppercase tracking-wider text-garage-chrome mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.ABOUT} className="text-garage-muted hover:text-garage-white transition-colors">
                  About the Garage
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SERVICES} className="text-garage-muted hover:text-garage-white transition-colors">
                  Training Services
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PLANS} className="text-garage-muted hover:text-garage-white transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TRAINERS} className="text-garage-muted hover:text-garage-white transition-colors">
                  Elite Coaches
                </Link>
              </li>
              <li>
                <Link to={ROUTES.GALLERY} className="text-garage-muted hover:text-garage-white transition-colors">
                  Gym & Transformations
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TESTIMONIALS} className="text-garage-muted hover:text-garage-white transition-colors">
                  Google Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours */}
          <div>
            <h4 className="text-lg font-bold font-display uppercase tracking-wider text-garage-chrome mb-4">
              Hours
            </h4>
            <ul className="space-y-3 text-sm text-garage-muted font-body">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-garage-chrome mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-garage-white block">Monday – Saturday</span>
                  <span>05:30 AM – 10:30 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-garage-chrome mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-garage-white block">Sunday</span>
                  <span>06:00 AM – 01:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-lg font-bold font-display uppercase tracking-wider text-garage-chrome mb-4">
              Visit Us
            </h4>
            <ul className="space-y-3 text-sm text-garage-muted font-body">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-garage-chrome mt-0.5 shrink-0" />
                <span>123 Iron Works Way, Fitness District</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-garage-chrome shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-garage-chrome shrink-0" />
                <span>contact@fitnessgarage.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-garage-mid/40 flex flex-col sm:flex-row items-center justify-between text-xs text-garage-muted">
          <p>© {new Date().getFullYear()} Fitness Garage. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to={ROUTES.MEMBER_LOGIN} className="hover:text-garage-white transition-colors">
              Member Portal
            </Link>
            <Link to={ROUTES.ADMIN_LOGIN} className="hover:text-garage-white transition-colors">
              Staff / Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
