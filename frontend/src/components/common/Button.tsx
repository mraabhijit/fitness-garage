import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-garage-chrome text-garage-black hover:bg-garage-chrome-dim active:scale-[0.98] shadow-md hover:shadow-garage-chrome/20',
    secondary:
      'bg-garage-dark text-garage-white border border-garage-mid hover:bg-garage-mid active:scale-[0.98]',
    outline:
      'bg-transparent text-garage-chrome border-2 border-garage-chrome hover:bg-garage-chrome hover:text-garage-black active:scale-[0.98]',
    danger:
      'bg-status-expired text-garage-white hover:bg-red-600 active:scale-[0.98]',
    ghost:
      'bg-transparent text-garage-muted hover:text-garage-white hover:bg-garage-dark/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded',
    md: 'px-5 py-2.5 text-sm rounded-md',
    lg: 'px-8 py-3.5 text-base rounded-md font-extrabold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2 border-t-current" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
