import React from 'react';

export interface DividerProps {
  className?: string;
  withSlash?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ className = '', withSlash = false }) => {
  if (withSlash) {
    return (
      <div className={`relative flex items-center justify-center my-8 ${className}`}>
        <div className="flex-grow border-t border-garage-mid" />
        <span className="px-4 text-garage-chrome font-display text-xl select-none">/</span>
        <div className="flex-grow border-t border-garage-mid" />
      </div>
    );
  }

  return <hr className={`border-t border-garage-mid my-6 ${className}`} />;
};
