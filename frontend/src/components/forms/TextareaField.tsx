import React from 'react'

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, helperText, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        <label
          htmlFor={textareaId}
          className="block text-xs font-bold uppercase tracking-wider text-garage-muted"
        >
          {label}
        </label>
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full px-4 py-2.5 bg-garage-black border ${
            error
              ? 'border-status-expired focus:border-status-expired'
              : 'border-garage-mid focus:border-garage-chrome'
          } rounded-lg text-garage-white placeholder:text-garage-muted/50 focus:outline-none focus:ring-1 focus:ring-garage-chrome/50 transition-colors text-sm resize-y ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-status-expired font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-garage-muted">{helperText}</p>}
      </div>
    )
  },
)

TextareaField.displayName = 'TextareaField'
