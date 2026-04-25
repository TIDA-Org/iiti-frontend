'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  apiCreateTrainingLocation,
  apiGetTrainingLocations,
  apiUpdateTrainingLocation,
  TrainingLocationApiResponse,
} from '@/lib/api/courses'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { MapPin, Pencil, Plus, X, Check } from 'lucide-react'
import { toast } from 'sonner'

const toNullableNumber = (value: string): number | null => {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export default function AdminCourseLocationsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<TrainingLocationApiResponse | null>(null)
  const [saving, setSaving] = useState(false)

  const [editName, setEditName] = useState('')
  const [editNameSi, setEditNameSi] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editMapsUrl, setEditMapsUrl] = useState('')
  const [editLatitude, setEditLatitude] = useState('')
  const [editLongitude, setEditLongitude] = useState('')
  const [editActive, setEditActive] = useState(true)
  const { hasPermission } = usePermissionAccess()

  const canCreateLocation = hasPermission('courses.create')
  const canEditLocation = hasPermission('courses.edit')

  useEffect(() => {
    if (!canEditLocation && editing) {
      setEditing(null)
    }
  }, [canEditLocation, editing])

  const { data, isLoading, error, refetch } = useApi<TrainingLocationApiResponse[]>(
    () => apiGetTrainingLocations(),
    [],
  )

  const locations = useMemo(() => {
    const list = data || []
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const startEdit = (row: TrainingLocationApiResponse) => {
    setEditing(row)
    setShowCreate(false)
    setEditName(row.name)
    setEditNameSi(row.name_si || '')
    setEditAddress(row.address || '')
    setEditCity(row.city || '')
    setEditDistrict(row.district || '')
    setEditMapsUrl(row.google_maps_url || '')
    setEditLatitude(row.latitude == null ? '' : String(row.latitude))
    setEditLongitude(row.longitude == null ? '' : String(row.longitude))
    setEditActive(row.is_active)
  }

  const resetEdit = () => {
    setEditing(null)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const fd = new FormData(e.currentTarget)

    try {
      await apiCreateTrainingLocation({
        name: ((fd.get('name') as string) || '').trim(),
        name_si: ((fd.get('name_si') as string) || '').trim() || null,
        address: ((fd.get('address') as string) || '').trim() || null,
        city: ((fd.get('city') as string) || '').trim() || null,
        district: ((fd.get('district') as string) || '').trim() || null,
        google_maps_url: ((fd.get('google_maps_url') as string) || '').trim() || null,
        latitude: toNullableNumber((fd.get('latitude') as string) || ''),
        longitude: toNullableNumber((fd.get('longitude') as string) || ''),
        is_active: true,
      })
      toast.success('Location created')
      setShowCreate(false)
      e.currentTarget.reset()
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create location')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await apiUpdateTrainingLocation(editing.id, {
        name: editName.trim(),
        name_si: editNameSi.trim() || null,
        address: editAddress.trim() || null,
        city: editCity.trim() || null,
        district: editDistrict.trim() || null,
        google_maps_url: editMapsUrl.trim() || null,
        latitude: toNullableNumber(editLatitude),
        longitude: toNullableNumber(editLongitude),
        is_active: editActive,
      })
      toast.success('Location updated')
      setEditing(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update location')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Training Locations"
        subtitle={data ? `${locations.length} locations` : 'Loading...'}
        actions={
          canCreateLocation ? (
            <button
              onClick={() => {
                setShowCreate((v) => !v)
                if (!showCreate) setEditing(null)
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCreate ? 'Cancel' : 'Add Location'}
            </button>
          ) : null
        }
      />

      {canEditLocation && editing && (
        <div className="bg-white rounded-xl border-2 border-amber-300 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Edit Location <span className="text-amber-600">{editing.name}</span>
            </h3>
            <button onClick={resetEdit} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name (Sinhala)</label>
              <input value={editNameSi} onChange={(e) => setEditNameSi(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
              <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
              <input value={editCity} onChange={(e) => setEditCity(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">District</label>
              <input value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Google Maps URL</label>
              <input value={editMapsUrl} onChange={(e) => setEditMapsUrl(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Latitude</label>
              <input value={editLatitude} onChange={(e) => setEditLatitude(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Longitude</label>
              <input value={editLongitude} onChange={(e) => setEditLongitude(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
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

          <div className="mt-5 flex items-center justify-end gap-2">
            <button onClick={resetEdit} className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving || !editName.trim()}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {canCreateLocation && showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">New Location</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
              <input name="name" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name (Sinhala)</label>
              <input name="name_si" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Address</label>
              <input name="address" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
              <input name="city" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">District</label>
              <input name="district" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Google Maps URL</label>
              <input name="google_maps_url" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Latitude</label>
              <input name="latitude" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Longitude</label>
              <input name="longitude" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={creating} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Location'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          {locations.length === 0 ? (
            <EmptyState icon={MapPin} title="No locations yet" description="Create your first training location." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">City</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">District</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Created</th>
                    {canEditLocation && <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {locations.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40">
                      <td className="px-5 py-3 text-sm text-slate-700">
                        <div className="font-medium">{row.name}</div>
                        {row.name_si && <div className="text-xs text-slate-400">{row.name_si}</div>}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{row.city || '-'}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">{row.district || '-'}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{formatDate(row.created_at)}</td>
                      {canEditLocation && (
                        <td className="px-5 py-3">
                          <button onClick={() => startEdit(row)} className="text-slate-500 hover:text-slate-700" title="Edit location">
                            <Pencil className="w-4 h-4" />
                          </button>
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
