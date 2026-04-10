'use client'

import { useState } from 'react'
import { apiGetStaffUsers, apiCreateStaffUser, apiUpdateStaffUser, apiDeleteStaffUser, StaffListApiResponse, StaffApiResponse } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { Users, Plus, Trash2, Pencil, X, Check, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<StaffApiResponse | null>(null)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editLanguage, setEditLanguage] = useState('en')

  const { data, isLoading, error, refetch } = useApi<StaffListApiResponse>(
    () => apiGetStaffUsers(1, 100),
    [],
  )

  const users = data?.items || []

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const fd = new FormData(e.currentTarget)
    try {
      await apiCreateStaffUser({
        full_name: fd.get('full_name') as string,
        email: fd.get('email') as string,
        phone: (fd.get('phone') as string) || null,
        password: fd.get('password') as string,
        role_slug: fd.get('role_slug') as string,
        preferred_language: 'en',
      })
      toast.success('Staff user created')
      setShowForm(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (user: StaffApiResponse) => {
    setEditingUser(user)
    setEditName(user.full_name)
    setEditEmail(user.email)
    setEditPhone(user.phone || '')
    setEditActive(user.is_active)
    setEditLanguage(user.preferred_language)
    setShowForm(false)
  }

  const cancelEdit = () => {
    setEditingUser(null)
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      await apiUpdateStaffUser(editingUser.id, {
        full_name: editName,
        email: editEmail,
        phone: editPhone || null,
        is_active: editActive,
        preferred_language: editLanguage,
      })
      toast.success('Staff user updated')
      setEditingUser(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPasswordInfo = () => {
    toast.info('Backend password reset for staff users is not implemented yet.')
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete staff user "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await apiDeleteStaffUser(id)
      toast.success('Staff user deleted')
      if (editingUser?.id === id) setEditingUser(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    front_desk: 'Front Desk',
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none'

  return (
    <div>
      <PageHeader
        title="Staff Users"
        subtitle={data ? `${data.total} staff accounts` : 'Loading...'}
        actions={
          <button
            onClick={() => { setShowForm(!showForm); setEditingUser(null) }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Staff'}
          </button>
        }
      />

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">New Staff User</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Full Name *</label>
              <input name="full_name" required minLength={1} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email (Login Username) *</label>
              <input name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
              <input name="phone" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Temporary Password *</label>
              <input name="password" type="password" required minLength={6} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Role *</label>
              <select name="role_slug" required className={inputClass}>
                <option value="">Select role...</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="front_desk">Front Desk</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={creating} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Staff User'}
            </button>
          </div>
        </form>
      )}

      {/* Edit Panel */}
      {editingUser && (
        <div className="bg-white rounded-xl border-2 border-amber-300 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Edit Staff User — <span className="text-amber-600">{editingUser.full_name}</span></h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Preferred Language</label>
              <select value={editLanguage} onChange={e => setEditLanguage(e.target.value)} className={inputClass}>
                <option value="en">English</option>
                <option value="si">Sinhala</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-xs font-medium text-slate-500">Account Active</label>
              <button
                type="button"
                onClick={() => setEditActive(!editActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editActive ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs font-medium ${editActive ? 'text-green-600' : 'text-slate-400'}`}>{editActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Role: <span className="font-medium text-slate-600">{editingUser.role_name || roleLabel[editingUser.role_slug || ''] || '-'}</span>
              <span className="ml-3">ID: <span className="font-mono">{editingUser.id.slice(0, 8)}...</span></span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetPasswordInfo}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:text-slate-700 hover:border-slate-300 transition-colors"
                title="Backend endpoint not available yet"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Reset Password
              </button>
              <button onClick={cancelEdit} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving || !editName.trim() || !editEmail.trim()}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          {users.length === 0 ? (
            <EmptyState icon={Users} title="No staff users yet" description="Add your first staff user using the button above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Phone</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user: StaffApiResponse) => (
                    <tr key={user.id} className={`hover:bg-slate-50 ${editingUser?.id === user.id ? 'bg-amber-50' : ''}`}>
                      <td className="px-5 py-3 font-medium text-slate-800">{user.full_name}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{user.email}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{user.phone || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {user.role_name || roleLabel[user.role_slug || ''] || user.role_slug || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(user.created_at)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(user)}
                            className="text-amber-500 hover:text-amber-600 transition-colors"
                            title="Edit staff user"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.full_name)}
                            disabled={deleting === user.id}
                            className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete staff user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataLoader>
      </div>
    </div>
  )
}
