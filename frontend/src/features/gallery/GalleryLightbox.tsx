import React, { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GalleryItem } from '../../types'
import { buildAssetUrl } from '../../utils/buildAssetUrl'

export interface GalleryLightboxProps {
  item: GalleryItem | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  item,
  onClose,
  onPrev,
  onNext,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onPrev) onPrev()
      if (e.key === 'ArrowRight' && onNext) onNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, onPrev, onNext])

  if (!item) return null

  const folder = item.folder || (item.folder_path?.replace('assets/', '') ?? 'gallery')
  const filename = item.filename || item.file_name || ''
  const mediaUrl = item.url || buildAssetUrl(folder, filename)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-garage-dark hover:bg-garage-chrome hover:text-garage-black text-garage-white transition-colors z-50"
        aria-label="Close Lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-garage-dark/80 hover:bg-garage-chrome hover:text-garage-black text-garage-white transition-colors z-50"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-garage-dark/80 hover:bg-garage-chrome hover:text-garage-black text-garage-white transition-colors z-50"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div
        className="max-w-5xl max-h-[85vh] flex flex-col items-center"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {item.media_type === 'video' ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="max-h-[75vh] max-w-full rounded-xl shadow-2xl"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={item.caption || 'Fitness Garage Gallery'}
            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
        )}
        {item.caption && (
          <p className="mt-4 text-center text-garage-muted font-body text-sm max-w-xl">
            {item.caption}
          </p>
        )}
      </div>
    </div>
  )
}
