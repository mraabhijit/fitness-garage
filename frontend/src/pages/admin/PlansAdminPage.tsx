import React, { useEffect, useState } from 'react'
import { AdminSidebar } from '../../components/layout/AdminSidebar'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { Modal } from '../../components/common/Modal'
import { FormField } from '../../components/forms/FormField'
import { adminService } from '../../services/adminService'
import type { MembershipPlan } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { Edit2 } from 'lucide-react'

export const PlansAdminPage: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null)
  const [formData, setFormData] = useState({
    price: 0,
    description: '',
    is_active: true,
  })

  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const data = await adminService.getPlans()
      setPlans(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleOpenEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan)
    setFormData({
      price: Number(plan.price),
      description: plan.description || '',
      is_active: plan.is_active,
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlan) return
    try {
      await adminService.updatePlan(editingPlan.id, {
        price: Number(formData.price),
        description: formData.description,
        is_active: formData.is_active,
      })
      setEditingPlan(null)
      loadPlans()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed'
      alert(message)
    }
  }

  return (
    <div className="flex min-h-screen bg-garage-black">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display uppercase tracking-wider text-garage-white">
            PLAN <span className="text-garage-chrome">/</span> PRICING MATRIX
          </h1>
          <p className="text-xs text-garage-muted font-body mt-1">
            Update pricing and descriptions for the 8 pre-seeded fixed catalog tiers.
          </p>
        </div>

        <Card className="p-6">
          {isLoading ? (
            <Spinner size="lg" className="my-12" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-garage-muted border-b border-garage-mid">
                  <tr>
                    <th className="pb-3 font-bold">Tier</th>
                    <th className="pb-3 font-bold">Duration</th>
                    <th className="pb-3 font-bold">Price (INR)</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garage-mid/40">
                  {plans.map((p) => (
                    <tr key={p.id} className="hover:bg-garage-mid/20 transition-colors">
                      <td className="py-3.5 font-bold uppercase text-garage-white">{p.tier}</td>
                      <td className="py-3.5 capitalize text-garage-muted">
                        {p.duration.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 font-bold text-garage-chrome">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            p.is_active
                              ? 'bg-status-active/10 text-status-active border border-status-active/30'
                              : 'bg-garage-mid text-garage-muted'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleOpenEdit(p)
                          }}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Edit Plan Modal */}
        <Modal
          isOpen={!!editingPlan}
          onClose={() => {
            setEditingPlan(null)
          }}
          title={`Edit Plan: ${editingPlan?.tier.toUpperCase()} (${editingPlan?.duration})`}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <FormField
              label="Price (INR)"
              type="number"
              required
              value={formData.price}
              onChange={(e) => {
                setFormData({ ...formData, price: Number(e.target.value) })
              }}
            />

            <FormField
              label="Description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
              }}
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active_plan"
                checked={formData.is_active}
                onChange={(e) => {
                  setFormData({ ...formData, is_active: e.target.checked })
                }}
                className="rounded border-garage-mid text-garage-chrome focus:ring-garage-chrome"
              />
              <label htmlFor="is_active_plan" className="text-xs font-semibold text-garage-white">
                Active in Public Catalog
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-garage-mid">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingPlan(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
