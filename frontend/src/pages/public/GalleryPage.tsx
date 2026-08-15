import React, { useEffect, useState } from 'react';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Spinner } from '../../components/common/Spinner';
import { publicService } from '../../services/publicService';
import { GalleryItem } from '../../types';
import { Image as ImageIcon } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'gallery' | 'transformations'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const folder =
          filter === 'gallery'
            ? 'assets/gallery'
            : filter === 'transformations'
            ? 'assets/transformations'
            : undefined;
        const data = await publicService.getGallery(folder);
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
      <SectionHeading
        badge="Visual Proof"
        title="FACILITY & / TRANSFORMATIONS"
        subtitle="Step inside our industrial training temple and witness real, measurable body composition changes."
      />

      {/* Filter Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex p-1 bg-garage-dark border border-garage-mid rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              filter === 'all' ? 'bg-garage-chrome text-garage-black' : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setFilter('gallery')}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              filter === 'gallery' ? 'bg-garage-chrome text-garage-black' : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            Gym Facility
          </button>
          <button
            onClick={() => setFilter('transformations')}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              filter === 'transformations'
                ? 'bg-garage-chrome text-garage-black'
                : 'text-garage-muted hover:text-garage-white'
            }`}
          >
            Transformations
          </button>
        </div>
      </div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-garage-muted">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg uppercase font-display tracking-wider">No media items available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative h-72 rounded-xl overflow-hidden bg-garage-dark border border-garage-mid transition-all hover:border-garage-chrome/50 hover:shadow-xl hover:shadow-black/50"
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.caption || 'Fitness Garage Media'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-garage-muted/40">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}

              {item.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-xs text-garage-white font-medium">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
