import React from 'react';

export interface StatBlockProps {
  value: string;
  label: string;
  subtext?: string;
  className?: string;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  value,
  label,
  subtext,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-garage-dark border border-garage-mid rounded-xl text-center transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      <span className="text-4xl md:text-6xl font-display text-garage-chrome tracking-wide font-extrabold">
        {value}
      </span>
      <span className="mt-2 text-sm md:text-base font-bold uppercase tracking-wider text-garage-white">
        {label}
      </span>
      {subtext && (
        <span className="mt-1 text-xs text-garage-muted">
          {subtext}
        </span>
      )}
    </div>
  );
};
