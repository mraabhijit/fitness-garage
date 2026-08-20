import React, { useEffect, useState } from 'react'
import { AdminSidebar } from '../../components/layout/AdminSidebar'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { Modal } from '../../components/common/Modal'
import { FormField } from '../../components/forms/FormField'
import { adminService } from '../../services/adminService'
import type { Achievement } from '../../types'
import { Edit2, Plus, Trash2 } from 'lucide-react'

export const StatsAdminPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAch, setEditingAch] = useState<Achievement | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    display_order: 0,
    is_active: true,
  })

  const loadAchievements = async () => {
    setIsLoading(true)
    try {
      const data = await adminService.getAchievements()
      setAchievements(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAchievements()
  }, [])

  const handleOpenCreate = () => {
    setEditingAch(null)
    setFormData({
      label: '',
      value: '',
      display_order: achievements.length + 1,
      is_active: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (ach: Achievement) => {
    setEditingAch(ach)
    setFormData({
      label: ach.label,
      value: ach.value || '',
      display_order: ach.display_order,
      is_active: ach.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAch) {
        await adminService.updateAchievement(editingAch.id, {
          label: formData.label,
          value: formData.value,
          display_order: Number(formData.display_order),
          is_active: formData.is_active,
        })
      } else {
        await adminService.createAchievement({
          label: formData.label,
          value: formData.value,
          display_order: Number(formData.display_order),
          is_active: formData.is_active,
        })
      }
      setIsModalOpen(false)
      loadAchievements()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed'
      alert(message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate achievement?')) return
    try {
      await adminService.deleteAchievement(id)
      loadAchievements()
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
              ACHIEVEMENTS <span className="text-garage-chrome">/</span> STATS
            </h1>
            <p className="text-xs text-garage-muted font-body mt-1">
              Live statistics displayed on the homepage stats bar.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Stat
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
                    <th className="pb-3 font-bold">Display Value</th>
                    <th className="pb-3 font-bold">Label</th>
                    <th className="pb-3 font-bold">Order</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garage-mid/40">
                  {achievements.map((ach) => (
                    <tr key={ach.id} className="hover:bg-garage-mid/20 transition-colors">
                      <td className="py-3.5 font-bold font-display text-xl text-garage-chrome">
                        {ach.value || 'N/A'}
                      </td>
                      <td className="py-3.5 font-bold text-garage-white">{ach.label}</td>
                      <td className="py-3.5 text-xs text-garage-muted">{ach.display_order}</td>
                      <td className="py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                            ach.is_active
                              ? 'bg-status-active/10 text-status-active border border-status-active/30'
                              : 'bg-garage-mid text-garage-muted'
                          }`}
                        >
                          {ach.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            handleOpenEdit(ach)
                          }}
                          className="p-1.5 text-garage-muted hover:text-garage-chrome transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ach.id)}
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
          title={editingAch ? 'Edit Stat Item' : 'New Stat Item'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <FormField
              label="Stat Value"
              required
              placeholder="e.g. 500+ or 12+"
              value={formData.value}
              onChange={(e) => {
                setFormData({ ...formData, value: e.target.value })
              }}
            />

            <FormField
              label="Stat Label"
              required
              placeholder="e.g. Active Athletes"
              value={formData.label}
              onChange={(e) => {
                setFormData({ ...formData, label: e.target.value })
              }}
            />

            <FormField
              label="Display Order"
              type="number"
              value={formData.display_order}
              onChange={(e) => {
                setFormData({ ...formData, display_order: Number(e.target.value) })
              }}
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active_ach"
                checked={formData.is_active}
                onChange={(e) => {
                  setFormData({ ...formData, is_active: e.target.checked })
                }}
                className="rounded border-garage-mid text-garage-chrome focus:ring-garage-chrome"
              />
              <label htmlFor="is_active_ach" className="text-xs font-semibold text-garage-white">
                Active on Home Page
              </label>
            </div>

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
                Save
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
