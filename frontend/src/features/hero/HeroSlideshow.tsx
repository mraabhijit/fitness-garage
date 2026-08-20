import React, { useEffect, useState } from 'react'
import type { HeroSlide } from '../../types'
import { buildAssetUrl } from '../../utils/buildAssetUrl'

export interface HeroSlideshowProps {
  slides: HeroSlide[]
  intervalMs?: number
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({
  slides,
  intervalMs = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!slides || slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, intervalMs)

    return () => {
      clearInterval(timer)
    }
  }, [slides, intervalMs])

  if (!slides || slides.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {slides.map((slide, index) => {
        const isCurrent = index === currentIndex
        const assetUrl = buildAssetUrl('hero', slide.filename)

        return (
          <div
            key={slide.filename}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide.media_type === 'video' ? (
              <video
                src={assetUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={assetUrl}
                alt={slide.alt || 'Fitness Garage'}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            )}
            <div className="absolute inset-0 bg-garage-black/75" />
          </div>
        )
      })}
    </div>
  )
}
