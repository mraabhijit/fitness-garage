import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-garage-dark/40 border border-garage-mid/60 rounded-2xl ${className}`}>
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-garage-mid/50 text-garage-chrome mb-4">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold font-display uppercase tracking-wider text-garage-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-garage-muted max-w-sm mb-6 font-body">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
