import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { SelectField } from '../../components/forms/SelectField';
import { adminService } from '../../services/adminService';
import { GalleryItem } from '../../types';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';

export const GalleryAdminPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    folder_path: 'assets/gallery',
    file_name: '',
    media_type: 'image',
    caption: '',
    display_order: 0,
    is_active: true,
  });

  const loadGallery = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getGallery();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createGalleryItem({
        folder_path: formData.folder_path as any,
        file_name: formData.file_name,
        media_type: formData.media_type as any,
        caption: formData.caption,
        display_order: Number(formData.display_order),
        is_active: formData.is_active,
      });
      setIsModalOpen(false);
      loadGallery();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery record?')) return;
    try {
      await adminService.deleteGalleryItem(id);
      loadGallery();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-garage-black">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
              GALLERY <span className="text-garage-chrome">/</span> ASSETS
            </h1>
            <p className="text-xs text-garage-muted font-body mt-1">
              Registered Supabase Storage photos for gym facilities & transformations.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Register Media
          </Button>
        </div>

        <Card className="p-6">
          {isLoading ? (
            <Spinner size="lg" className="my-12" />
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-garage-muted">
              No gallery items registered.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-garage-dark border border-garage-mid rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="h-44 bg-garage-mid/40 flex items-center justify-center overflow-hidden relative">
                    {item.url ? (
                      <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-garage-muted/40" />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-garage-black/80 text-[10px] uppercase font-bold text-garage-chrome border border-garage-mid">
                      {item.folder_path.replace('assets/', '')}
                    </span>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-garage-white truncate">{item.file_name}</p>
                      {item.caption && <p className="text-[11px] text-garage-muted mt-1">{item.caption}</p>}
                    </div>

                    <div className="mt-4 pt-3 border-t border-garage-mid/50 flex items-center justify-between">
                      <span className="text-[10px] text-garage-muted">Order: {item.display_order}</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-garage-muted hover:text-status-expired transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register Storage Media"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <SelectField
              label="Folder Category"
              value={formData.folder_path}
              onChange={(e) => setFormData({ ...formData, folder_path: e.target.value })}
              options={[
                { value: 'assets/gallery', label: 'Gym Facility (assets/gallery)' },
                { value: 'assets/transformations', label: 'Transformations (assets/transformations)' },
              ]}
            />

            <FormField
              label="File Name in Storage"
              required
              placeholder="e.g. gym-squat-rack.jpg"
              value={formData.file_name}
              onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
            />

            <FormField
              label="Caption / Tagline"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            />

            <FormField
              label="Display Order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-garage-mid">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Register
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
