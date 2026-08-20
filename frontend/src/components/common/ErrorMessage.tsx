import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

export interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, className = '' }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 bg-status-expired/10 border border-status-expired/30 rounded-xl text-center ${className}`}
    >
      <AlertCircle className="w-8 h-8 text-status-expired mb-2" />
      <p className="text-sm font-medium text-garage-white mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          Try Again
        </Button>
      )}
    </div>
  )
}
