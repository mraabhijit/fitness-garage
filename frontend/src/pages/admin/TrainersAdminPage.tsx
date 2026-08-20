import React, { useEffect, useState } from 'react'
import { AdminSidebar } from '../../components/layout/AdminSidebar'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { Modal } from '../../components/common/Modal'
import { FormField } from '../../components/forms/FormField'
import { TextareaField } from '../../components/forms/TextareaField'
import { adminService } from '../../services/adminService'
import type { Trainer } from '../../types'
import { Edit2, Plus, Trash2 } from 'lucide-react'

export const TrainersAdminPage: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    specialization: '',
    experience_years: 5,
    certifications: '',
    bio: '',
    display_order: 0,
    is_active: true,
  })

  const loadTrainers = async () => {
    setIsLoading(true)
    try {
      const data = await adminService.getTrainers()
      setTrainers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTrainers()
  }, [])

  const handleOpenCreate = () => {
    setEditingTrainer(null)
    setFormData({
      name: '',
      slug: '',
      specialization: '',
      experience_years: 5,
      certifications: '',
      bio: '',
      display_order: trainers.length + 1,
      is_active: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (t: Trainer) => {
    setEditingTrainer(t)
    setFormData({
      name: t.name,
      slug: t.slug,
      specialization: t.specialization,
      experience_years: t.experience_years,
      certifications: (t.certifications || []).join(', '),
      bio: t.bio || '',
      display_order: t.display_order ?? 0,
      is_active: t.is_active ?? true,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: formData.name,
      slug: formData.slug,
      specialization: formData.specialization,
      experience_years: Number(formData.experience_years),
      certifications: formData.certifications
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      bio: formData.bio,
      display_order: Number(formData.display_order),
      is_active: formData.is_active,
    }

    try {
      if (editingTrainer) {
        await adminService.updateTrainer(editingTrainer.id, payload)
      } else {
        await adminService.createTrainer(payload)
      }
      setIsModalOpen(false)
      loadTrainers()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed'
      alert(message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate trainer profile?')) return
    try {
      await adminService.deleteTrainer(id)
      loadTrainers()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Deactivation failed'
      alert(message)
    }
  }

  return (
    <div className="flex min-h-screen bg-garage-black">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
              COACHES <span className="text-garage-chrome">/</span> TRAINERS
            </h1>
            <p className="text-xs text-garage-muted font-body mt-1">
              Manage trainer profiles, specializations, and accreditation badges.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Trainer
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
                    <th className="pb-3 font-bold">Coach</th>
                    <th className="pb-3 font-bold">Specialization</th>
                    <th className="pb-3 font-bold">Experience</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garage-mid/40">
                  {trainers.map((t) => (
                    <tr key={t.id} className="hover:bg-garage-mid/20 transition-colors">
                      <td className="py-3.5 font-bold text-garage-white">{t.name}</td>
                      <td className="py-3.5 text-xs text-garage-chrome">{t.specialization}</td>
                      <td className="py-3.5 text-xs text-garage-muted">
                        {t.experience_years} Years
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                            t.is_active
                              ? 'bg-status-active/10 text-status-active border border-status-active/30'
                              : 'bg-garage-mid text-garage-muted'
                          }`}
                        >
                          {t.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            handleOpenEdit(t)
                          }}
                          className="p-1.5 text-garage-muted hover:text-garage-chrome transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
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
          onClose={() => {
            setIsModalOpen(false)
          }}
          title={editingTrainer ? 'Edit Coach Profile' : 'Add Coach'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <FormField
              label="Coach Name"
              required
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value
                setFormData({
                  ...formData,
                  name,
                  slug: editingTrainer
                    ? formData.slug
                    : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Slug"
                required
                value={formData.slug}
                onChange={(e) => {
                  setFormData({ ...formData, slug: e.target.value })
                }}
              />
              <FormField
                label="Experience (Years)"
                type="number"
                value={formData.experience_years}
                onChange={(e) => {
                  setFormData({ ...formData, experience_years: Number(e.target.value) })
                }}
              />
            </div>

            <FormField
              label="Specialization"
              placeholder="e.g. Strength & Conditioning / Hypertrophy"
              required
              value={formData.specialization}
              onChange={(e) => {
                setFormData({ ...formData, specialization: e.target.value })
              }}
            />

            <FormField
              label="Certifications (Comma-separated)"
              placeholder="CSCS, NASM-CPT, Precision Nutrition"
              value={formData.certifications}
              onChange={(e) => {
                setFormData({ ...formData, certifications: e.target.value })
              }}
            />

            <TextareaField
              label="Bio"
              rows={3}
              value={formData.bio}
              onChange={(e) => {
                setFormData({ ...formData, bio: e.target.value })
              }}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-garage-mid">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Coach
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
