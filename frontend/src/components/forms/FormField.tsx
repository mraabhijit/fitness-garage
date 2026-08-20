import React from 'react'

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-garage-muted"
        >
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-4 py-2.5 bg-garage-black border ${
            error
              ? 'border-status-expired focus:border-status-expired'
              : 'border-garage-mid focus:border-garage-chrome'
          } rounded-lg text-garage-white placeholder:text-garage-muted/50 focus:outline-none focus:ring-1 focus:ring-garage-chrome/50 transition-colors text-sm ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-status-expired font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-garage-muted">{helperText}</p>}
      </div>
    )
  },
)

FormField.displayName = 'FormField'
