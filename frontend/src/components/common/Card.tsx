import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'chrome' | 'outline';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-garage-dark border border-garage-mid rounded-xl overflow-hidden transition-all duration-300';

  const variants = {
    default: '',
    interactive: 'hover:border-garage-chrome/50 hover:bg-[#323232] cursor-pointer',
    chrome: 'border-garage-chrome/40 shadow-lg shadow-garage-chrome/5',
    outline: 'bg-transparent border-garage-mid hover:border-garage-chrome/40',
  };

  const hoverStyle = hoverEffect ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50' : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
