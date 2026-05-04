'use client'

import { useMemo, useState } from 'react'
import {
  apiCreateRole,
  apiDeleteRole,
  apiGetPermissions,
  apiGetRole,
  apiGetRoles,
  apiSetRolePermissions,
  apiUpdateRole,
  PermissionApiResponse,
  RoleApiResponse,
} from '@/lib/api/roles'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { useApi } from '@/hooks/useApi'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { formatDate } from '@/lib/utils'
import { Check, KeyRound, Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

const slugPattern = /^[a-z][a-z0-9_]*$/

export default function AdminRolesPage() {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [editingRole, setEditingRole] = useState<RoleApiResponse | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const { hasPermission } = usePermissionAccess()

  const canManageRoles = hasPermission('roles.manage')

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useApi<RoleApiResponse[]>(() => apiGetRoles(), [])

  const {
    data: permissions,
    isLoading: permsLoading,
    error: permsError,
    refetch: refetchPermissions,
  } = useApi<PermissionApiResponse[]>(() => apiGetPermissions(), [])

  const permissionGroups = useMemo(() => {
    const groups: Record<string, PermissionApiResponse[]> = {}
    ;(permissions || []).forEach((p) => {
      if (!groups[p.module]) groups[p.module] = []
      groups[p.module].push(p)
    })
    Object.values(groups).forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)))
    return groups
  }, [permissions])

  const filteredRoles = useMemo(() => {
    const list = roles || []
    if (!search.trim()) return list
    const lowerSearch = search.toLowerCase()
    return list.filter((role) =>
      role.name?.toLowerCase().includes(lowerSearch) ||
      role.slug?.toLowerCase().includes(lowerSearch) ||
      role.description?.toLowerCase().includes(lowerSearch)
    )
  }, [roles, search])

  const togglePermission = (permissionId: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    )
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const fd = new FormData(e.currentTarget)

    const name = (fd.get('name') as string).trim()
    const slug = (fd.get('slug') as string).trim()
    const description = ((fd.get('description') as string) || '').trim()

    if (!slugPattern.test(slug)) {
      toast.error('Slug must be lowercase with underscores only (e.g. data_entry).')
      setCreating(false)
      return
    }

    try {
      const created = await apiCreateRole({
        name,
        slug,
        description: description || null,
      })

      if (selectedPermissionIds.length > 0) {
        await apiSetRolePermissions(created.id, selectedPermissionIds)
        window.dispatchEvent(new Event('rbac-updated'))
      }

      toast.success('Role created successfully')
      setShowCreate(false)
      setSelectedPermissionIds([])
      e.currentTarget.reset()
      refetchRoles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create role')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = async (id: number) => {
    setLoadingEdit(true)
    setShowCreate(false)
    try {
      const role = await apiGetRole(id)
      setEditingRole(role)
      setEditName(role.name)
      setEditDescription(role.description || '')
      setEditActive(role.is_active)
      setSelectedPermissionIds(role.permissions.map((p) => p.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load role')
    } finally {
      setLoadingEdit(false)
    }
  }

  const cancelEdit = () => {
    setEditingRole(null)
    setSelectedPermissionIds([])
  }

  const handleSaveEdit = async () => {
    if (!editingRole) return
    setSaving(true)
    try {
      await apiUpdateRole(editingRole.id, {
        name: editName.trim() || undefined,
        description: editDescription.trim() || null,
        is_active: editActive,
      })
      await apiSetRolePermissions(editingRole.id, selectedPermissionIds)
      window.dispatchEvent(new Event('rbac-updated'))
      toast.success('Role updated successfully')
      setEditingRole(null)
      setSelectedPermissionIds([])
      refetchRoles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role: RoleApiResponse) => {
    if (role.is_system) {
      toast.error('System roles cannot be deleted')
      return
    }

    const confirmed = window.confirm(`Delete role "${role.name}"? This action cannot be undone.`)
    if (!confirmed) return

    setDeleting(role.id)
    try {
      await apiDeleteRole(role.id)
      toast.success('Role deleted successfully')
      if (editingRole?.id === role.id) {
        setEditingRole(null)
        setSelectedPermissionIds([])
      }
      refetchRoles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete role')
    } finally {
      setDeleting(null)
    }
  }

  const roleList = filteredRoles
  const loading = rolesLoading || permsLoading
  const error = rolesError || permsError

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle={roles ? `${filteredRoles.length} results` : 'Loading...'}
        actions={
          canManageRoles ? (
            <button
              onClick={() => {
                setShowCreate((v) => !v)
                if (!showCreate) cancelEdit()
                if (showCreate) setSelectedPermissionIds([])
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCreate ? 'Cancel' : 'Add Role'}
            </button>
          ) : null
        }
      />

      {canManageRoles && showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Create New Role</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Role Name *</label>
              <input name="name" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Data Entry" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Slug *</label>
              <input name="slug" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. data_entry" />
              <p className="text-xs text-slate-400 mt-1">Lowercase letters, numbers, underscores only.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea name="description" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium text-slate-500 mb-2">Permissions</p>
            <div className="border border-slate-200 rounded-lg p-3 max-h-64 overflow-auto">
              {permissions && permissions.length > 0 ? (
                Object.entries(permissionGroups).map(([module, list]) => (
                  <div key={module} className="mb-3 last:mb-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{module}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {list.map((permission) => (
                        <label key={permission.id} className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedPermissionIds.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No permissions available.</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={creating} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      )}

      {canManageRoles && editingRole && (
        <div className="bg-white rounded-xl border-2 border-amber-300 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Edit Role <span className="text-amber-600">{editingRole.name}</span>
            </h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Role Name *</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" disabled={editingRole.is_system} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Slug</label>
              <input value={editingRole.slug} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-xs font-medium text-slate-500">Active</label>
              <button
                type="button"
                onClick={() => setEditActive(!editActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editActive ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium text-slate-500 mb-2">Permissions</p>
            <div className="border border-slate-200 rounded-lg p-3 max-h-64 overflow-auto">
              {permissions && permissions.length > 0 ? (
                Object.entries(permissionGroups).map(([module, list]) => (
                  <div key={module} className="mb-3 last:mb-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{module}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {list.map((permission) => (
                        <label key={permission.id} className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedPermissionIds.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No permissions available.</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button onClick={cancelEdit} className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving || !editName.trim()}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by role name, slug, or description..." className="max-w-sm" />
          <span className="text-sm text-slate-400">{filteredRoles.length} results</span>
        </div>
        <DataLoader
          isLoading={loading || loadingEdit}
          error={error}
          onRetry={async () => {
            await Promise.all([refetchRoles(), refetchPermissions()])
          }}
        >
          {roleList.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No roles yet" description={search ? "No roles match your search." : "Create your first custom role."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Permissions</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Created</th>
                    {canManageRoles && <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {roleList.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50/40">
                      <td className="px-5 py-3 text-sm text-slate-700">
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-slate-400">{role.slug}</div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{role.is_system ? 'System' : 'Custom'}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5" />
                          {role.permissions.length}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={role.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{formatDate(role.created_at)}</td>
                      {canManageRoles && (
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => startEdit(role.id)} className="text-slate-500 hover:text-slate-700" title="Edit role">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(role)}
                              disabled={deleting === role.id || role.is_system}
                              className="text-red-500 hover:text-red-700 disabled:opacity-40"
                              title={role.is_system ? 'System role cannot be deleted' : 'Delete role'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
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
