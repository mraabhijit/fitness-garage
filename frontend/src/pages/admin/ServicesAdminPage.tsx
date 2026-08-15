import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { TextareaField } from '../../components/forms/TextareaField';
import { adminService } from '../../services/adminService';
import { Service } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const ServicesAdminPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getServices();
      setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      display_order: services.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      slug: svc.slug,
      description: svc.description || '',
      display_order: svc.display_order,
      is_active: svc.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await adminService.updateService(editingService.id, formData);
      } else {
        await adminService.createService(formData);
      }
      setIsModalOpen(false);
      loadServices();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await adminService.deleteService(id);
      loadServices();
    } catch (err: any) {
      alert(err.message || 'Deactivation failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-garage-black">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
              SERVICES <span className="text-garage-chrome">/</span> AMENITIES
            </h1>
            <p className="text-xs text-garage-muted font-body mt-1">
              Configure training programs displayed on the public marketing site.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Service
          </Button>
        </div>

        <Card className="p-6">
          {isLoading ? (
            <Spinner size="lg" className="my-12" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-garage-muted border-b border-garage-mid">
                  <tr>
                    <th className="pb-3 font-bold">Service Name</th>
                    <th className="pb-3 font-bold">Slug</th>
                    <th className="pb-3 font-bold">Order</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garage-mid/40">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-garage-mid/20 transition-colors">
                      <td className="py-3.5 font-bold text-garage-white">{s.name}</td>
                      <td className="py-3.5 text-xs text-garage-muted font-mono">{s.slug}</td>
                      <td className="py-3.5 text-xs text-garage-white">{s.display_order}</td>
                      <td className="py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                            s.is_active
                              ? 'bg-status-active/10 text-status-active border border-status-active/30'
                              : 'bg-garage-mid text-garage-muted'
                          }`}
                        >
                          {s.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-garage-muted hover:text-garage-chrome transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-garage-muted hover:text-status-expired transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingService ? 'Edit Service' : 'Add New Service'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <FormField
              label="Service Name"
              required
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: editingService ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                });
              }}
            />

            <FormField
              label="Slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />

            <TextareaField
              label="Description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Display Order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active_svc"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-garage-mid text-garage-chrome focus:ring-garage-chrome"
                />
                <label htmlFor="is_active_svc" className="text-xs font-semibold text-garage-white">
                  Active
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-garage-mid">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Service
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
