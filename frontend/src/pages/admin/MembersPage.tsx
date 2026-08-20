import React, { useEffect, useState } from 'react'
import { AdminSidebar } from '../../components/layout/AdminSidebar'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Spinner } from '../../components/common/Spinner'
import { Modal } from '../../components/common/Modal'
import { FormField } from '../../components/forms/FormField'
import { SelectField } from '../../components/forms/SelectField'
import { adminService } from '../../services/adminService'
import type { Member, MembershipPlan, MembershipStatus } from '../../types'
import { formatDate } from '../../utils/formatters'
import { Edit2, Search, Trash2, UserPlus } from 'lucide-react'

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([])
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email_address: '',
    membership_plan_id: '',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: '',
  })

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const [membersRes, plansRes] = await Promise.all([
        adminService.getMembers(page, 15, search || undefined, statusFilter || undefined),
        adminService.getPlans().catch(() => []),
      ])
      setMembers(membersRes.data || [])
      setTotal(membersRes.total || 0)
      setPlans(plansRes)
    } catch (e) {
      console.error('Error fetching members', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadMembers()
  }

  const handleOpenCreate = () => {
    setEditingMember(null)
    setFormData({
      full_name: '',
      phone_number: '',
      email_address: '',
      membership_plan_id: plans[0]?.id || '',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      notes: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m)
    setFormData({
      full_name: m.full_name,
      phone_number: m.phone_number || '',
      email_address: m.email_address || '',
      membership_plan_id: m.membership_plan_id || '',
      status: m.status,
      start_date: m.start_date,
      expiry_date: m.expiry_date,
      notes: m.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        status: formData.status as MembershipStatus,
      }
      if (editingMember) {
        await adminService.updateMember(editingMember.id, payload)
      } else {
        await adminService.createMember(payload)
      }
      setIsModalOpen(false)
      loadMembers()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed'
      alert(message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this member?')) return
    try {
      await adminService.deleteMember(id)
      loadMembers()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Suspension failed'
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
              MEMBER <span className="text-garage-chrome">/</span> ROSTER
            </h1>
            <p className="text-xs text-garage-muted font-body mt-1">
              Encrypted directory of {total} registered gym athletes.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            New Member
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <FormField
              label=""
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
              className="py-2"
            />
            <Button type="submit" variant="secondary" size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          <div className="w-48">
            <SelectField
              label=""
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
              }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'expired', label: 'Expired Only' },
                { value: 'pending', label: 'Pending Only' },
              ]}
              className="py-2"
            />
          </div>
        </div>

        {/* Members Table */}
        <Card className="p-6">
          {isLoading ? (
            <Spinner size="lg" className="my-12" />
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-garage-muted">
              No members match the current query criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-garage-muted border-b border-garage-mid">
                  <tr>
                    <th className="pb-3 font-bold">Athlete</th>
                    <th className="pb-3 font-bold">Contact</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold">Expiry</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-garage-mid/40">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-garage-mid/20 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-garage-white">{m.full_name}</div>
                        <div className="text-[11px] text-garage-muted font-mono">
                          {m.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="py-3.5 text-xs text-garage-muted">
                        <div>{m.phone_number || 'No phone'}</div>
                        <div>{m.email_address || 'No email'}</div>
                      </td>
                      <td className="py-3.5">
                        <Badge status={m.status} />
                      </td>
                      <td className="py-3.5 text-xs text-garage-white font-medium">
                        {formatDate(m.expiry_date)}
                      </td>
                      <td className="py-3.5 text-right space-x-1">
                        <button
                          onClick={() => {
                            handleOpenEdit(m)
                          }}
                          className="p-1.5 rounded text-garage-muted hover:text-garage-chrome hover:bg-garage-mid transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded text-garage-muted hover:text-status-expired hover:bg-garage-mid transition-colors"
                          title="Suspend"
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

        {/* Member Edit / Create Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
          }}
          title={editingMember ? 'Update Member Profile' : 'Register New Member'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <FormField
              label="Full Name"
              required
              value={formData.full_name}
              onChange={(e) => {
                setFormData({ ...formData, full_name: e.target.value })
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Phone Number"
                value={formData.phone_number}
                onChange={(e) => {
                  setFormData({ ...formData, phone_number: e.target.value })
                }}
              />
              <FormField
                label="Email Address"
                type="email"
                value={formData.email_address}
                onChange={(e) => {
                  setFormData({ ...formData, email_address: e.target.value })
                }}
              />
            </div>

            <SelectField
              label="Membership Plan"
              value={formData.membership_plan_id}
              onChange={(e) => {
                setFormData({ ...formData, membership_plan_id: e.target.value })
              }}
              options={[
                { value: '', label: 'Select a plan...' },
                ...plans.map((p) => ({
                  value: p.id,
                  label: `${p.tier.toUpperCase()} - ${p.duration} (₹${p.price})`,
                })),
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Status"
                value={formData.status}
                onChange={(e) => {
                  setFormData({ ...formData, status: e.target.value })
                }}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'suspended', label: 'Suspended' },
                ]}
              />
              <FormField
                label="Start Date"
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => {
                  setFormData({ ...formData, start_date: e.target.value })
                }}
              />
              <FormField
                label="Expiry Date"
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => {
                  setFormData({ ...formData, expiry_date: e.target.value })
                }}
              />
            </div>

            <FormField
              label="Staff Notes"
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value })
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
                Save Member
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}
