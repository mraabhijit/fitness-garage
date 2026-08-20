import React from 'react'

export interface SectionHeadingProps {
  title: string
  subtitle?: string
  badge?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badge,
  align = 'center',
  className = '',
}) => {
  const alignments = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }

  const formattedTitle = title.split('/').map((part, i) => (
    <span key={i}>
      {i > 0 && <span className="text-garage-chrome mx-2 font-display select-none">/</span>}
      {part.trim()}
    </span>
  ))

  return (
    <div className={`flex flex-col ${alignments[align]} mb-12 ${className}`}>
      {badge && (
        <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-widest text-garage-chrome bg-garage-chrome/10 border border-garage-chrome/20 rounded-full">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-garage-white">
        {formattedTitle}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base md:text-lg text-garage-muted max-w-2xl font-body">
          {subtitle}
        </p>
      )}
    </div>
  )
}
