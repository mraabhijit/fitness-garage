import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export interface PageWrapperProps {
  children: React.ReactNode;
  showNav?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  showNav = true,
  showFooter = true,
  className = '',
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-garage-black text-garage-white">
      {showNav && <Navbar />}
      <main className={`flex-grow ${className}`}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
