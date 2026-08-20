import React from 'react'
import { Play } from 'lucide-react'
import type { GalleryItem } from '../../types'
import { Card } from '../../components/common/Card'
import { buildAssetUrl } from '../../utils/buildAssetUrl'

export interface GalleryGridProps {
  items: GalleryItem[]
  onItemClick: (item: GalleryItem) => void
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items, onItemClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const folder = item.folder || (item.folder_path?.replace('assets/', '') ?? 'gallery')
        const filename = item.filename || item.file_name || ''
        const mediaUrl = item.url || buildAssetUrl(folder, filename)

        return (
          <Card
            key={item.id}
            hoverEffect
            className="group relative overflow-hidden aspect-4/3 cursor-pointer p-0"
            onClick={() => {
              onItemClick(item)
            }}
          >
            {item.media_type === 'video' ? (
              <div className="relative w-full h-full bg-garage-dark">
                <video src={mediaUrl} className="w-full h-full object-cover" muted />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-garage-chrome flex items-center justify-center text-garage-black shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={mediaUrl}
                alt={item.caption || 'Fitness Garage'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex items-end">
              <p className="text-garage-white text-sm font-body font-medium">
                {item.caption || 'Fitness Garage'}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
