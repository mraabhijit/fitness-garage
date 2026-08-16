import React from 'react';

export interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  dark?: boolean;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  id,
  className = '',
  containerClassName = '',
  dark = false,
}) => {
  const bg = dark ? 'bg-garage-black' : 'bg-[#1e1e1e]';

  return (
    <section id={id} className={`py-16 md:py-24 ${bg} relative overflow-hidden ${className}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
};
