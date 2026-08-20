import React, { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

  const goToNext = useCallback(() => {
    if (!slides || slides.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides])

  const goToPrev = useCallback(() => {
    if (!slides || slides.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  useEffect(() => {
    if (!slides || slides.length <= 1) return

    const timer = setInterval(() => {
      goToNext()
    }, intervalMs)

    return () => {
      clearInterval(timer)
    }
  }, [slides, intervalMs, goToNext])

  if (!slides || slides.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Slides */}
      <div className="absolute inset-0 pointer-events-none">
        {slides.map((slide, index) => {
          const isCurrent = index === currentIndex
          const assetUrl = buildAssetUrl('hero', slide.filename)

          return (
            <div
              key={slide.filename || index}
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
              <div className="absolute inset-0 bg-garage-black/60" />
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous Slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-garage-black/60 border border-garage-mid/60 text-garage-chrome hover:bg-garage-chrome hover:text-garage-black hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-garage-chrome/50 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-garage-black/60 border border-garage-mid/60 text-garage-chrome hover:bg-garage-chrome hover:text-garage-black hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-garage-chrome/50 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-8 h-2.5 bg-garage-chrome'
                    : 'w-2.5 h-2.5 bg-garage-white/30 hover:bg-garage-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
