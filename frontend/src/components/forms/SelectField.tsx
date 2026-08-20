import React from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
  helperText?: string
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full space-y-1.5">
        <label
          htmlFor={selectId}
          className="block text-xs font-bold uppercase tracking-wider text-garage-muted"
        >
          {label}
        </label>
        <select
          id={selectId}
          ref={ref}
          className={`w-full px-4 py-2.5 bg-garage-black border ${
            error
              ? 'border-status-expired focus:border-status-expired'
              : 'border-garage-mid focus:border-garage-chrome'
          } rounded-lg text-garage-white focus:outline-none focus:ring-1 focus:ring-garage-chrome/50 transition-colors text-sm ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-garage-dark text-garage-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-status-expired font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-garage-muted">{helperText}</p>}
      </div>
    )
  },
)

SelectField.displayName = 'SelectField'
