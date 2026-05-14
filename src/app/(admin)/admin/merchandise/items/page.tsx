'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  apiGetMerchandiseItems,
  apiCreateMerchandiseItem,
  apiUpdateMerchandiseItem,
  apiDeleteMerchandiseItem,
  MerchandiseItemApiResponse,
} from '@/lib/api/merchandise'
import { useApi } from '@/hooks/useApi'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { Package, Check, Pencil, Plus, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminMerchandiseItemsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingItem, setEditingItem] = useState<MerchandiseItemApiResponse | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [editName, setEditName] = useState('')
  const [editNameSi, setEditNameSi] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDescriptionSi, setEditDescriptionSi] = useState('')
  const [editSku, setEditSku] = useState('')
  const [editPrice, setEditPrice] = useState<number>(0)
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editStockQty, setEditStockQty] = useState<number>(0)
  const [editActive, setEditActive] = useState(true)
  const [editDisplayOrder, setEditDisplayOrder] = useState<number>(0)
  const [createVariants, setCreateVariants] = useState<Array<{ type: string; options: string[] }>>([
    { type: 'size', options: [] },
    { type: 'color', options: [] },
  ])
  const [editVariants, setEditVariants] = useState<Array<{ type: string; options: string[] }>>([
    { type: 'size', options: [] },
    { type: 'color', options: [] },
  ])

  const { hasPermission } = usePermissionAccess()
  const canManageMerchandise = hasPermission('merchandise.manage')

  const { data: itemsData, isLoading, error, refetch } = useApi<any>(
    () => apiGetMerchandiseItems(1, 100),
    []
  )

  const items = itemsData?.items || []

  useEffect(() => {
    if (!canManageMerchandise && editingItem) {
      setEditingItem(null)
    }
  }, [canManageMerchandise, editingItem])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const fd = new FormData(e.currentTarget)
    try {
      await apiCreateMerchandiseItem({
        name: fd.get('name') as string,
        name_si: (fd.get('name_si') as string) || null,
        description: (fd.get('description') as string) || null,
        description_si: (fd.get('description_si') as string) || null,
        sku: (fd.get('sku') as string) || null,
        price: Number(fd.get('price')),
        image_url: (fd.get('image_url') as string) || null,
        stock_qty: Number(fd.get('stock_qty')) || 0,
        is_active: true,
        display_order: Number(fd.get('display_order')) || 0,
        variants: createVariants.filter(v => v.options.length > 0) || null,
      })
      toast.success('Item created')
      setShowForm(false)
      ;(e.target as HTMLFormElement).reset()
      setCreateVariants([
        { type: 'size', options: [] },
        { type: 'color', options: [] },
      ])
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create item')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (item: MerchandiseItemApiResponse) => {
    setEditingItem(item)
    setShowForm(false)
    setEditName(item.name)
    setEditNameSi(item.name_si || '')
    setEditDescription(item.description || '')
    setEditDescriptionSi(item.description_si || '')
    setEditSku(item.sku || '')
    setEditPrice(item.price)
    setEditImageUrl(item.image_url || '')
    setEditStockQty(item.stock_qty)
    setEditActive(item.is_active)
    setEditDisplayOrder(item.display_order)
    setEditVariants((item.variants as Array<{ type: string; options: string[] }>) || [
      { type: 'size', options: [] },
      { type: 'color', options: [] },
    ])
  }

  const cancelEdit = () => {
    setEditingItem(null)
  }

  const handleUpdate = async () => {
    if (!editingItem) return
    setSaving(true)
    try {
      await apiUpdateMerchandiseItem(editingItem.id, {
        name: editName,
        name_si: editNameSi || null,
        description: editDescription || null,
        description_si: editDescriptionSi || null,
        sku: editSku || null,
        price: editPrice,
        image_url: editImageUrl || null,
        stock_qty: editStockQty,
        is_active: editActive,
        display_order: editDisplayOrder,
        variants: editVariants.filter(v => v.options.length > 0) || null,
      })
      toast.success('Item updated')
      setEditingItem(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingItem) return
    if (!confirm('Delete this item? Orders referencing it will still exist.')) return
    setDeleting(true)
    try {
      await apiDeleteMerchandiseItem(editingItem.id)
      toast.success('Item deleted')
      setEditingItem(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete item')
    } finally {
      setDeleting(false)
    }
  }

  const filteredItems = useMemo(() => {
    const currentItems = itemsData?.items || []
    if (!search.trim()) return currentItems
    const lowerSearch = search.toLowerCase()
    return currentItems.filter(
      (item: MerchandiseItemApiResponse) =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.sku?.toLowerCase().includes(lowerSearch) ||
        item.name_si?.toLowerCase().includes(lowerSearch)
    )
  }, [itemsData, search])

  return (
    <div>
      <PageHeader
        title="Merchandise Items"
        subtitle={items ? `${filteredItems.length} items` : 'Loading...'}
        actions={
          canManageMerchandise ? (
            <button
              onClick={() => {
                setShowForm(!showForm)
                if (!showForm) setEditingItem(null)
              }}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'Add Item'}
            </button>
          ) : null
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name, SKU, or Sinhala name..."
                className="flex-1"
              />
              <span className="text-sm text-slate-400">{filteredItems.length} results</span>
            </div>
            <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
              {filteredItems.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Package}
                    title="No merchandise items"
                    description="Create your first merchandise item to get started."
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredItems.map((item: MerchandiseItemApiResponse) => (
                    <button
                      key={item.id}
                      onClick={() => startEdit(item)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">{item.name}</h4>
                        {item.name_si && <p className="text-xs text-slate-500 truncate">{item.name_si}</p>}
                        {item.sku && <p className="text-xs text-slate-400">SKU: {item.sku}</p>}
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">LKR {item.price.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">Stock: {item.stock_qty}</p>
                        </div>
                        <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </DataLoader>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1">
          {canManageMerchandise && showForm && (
            <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
              <h3 className="font-semibold text-slate-900 mb-4">New Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Name (English) *</label>
                  <input
                    name="name"
                    required
                    minLength={1}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Name (Sinhala)</label>
                  <input
                    name="name_si"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">SKU</label>
                  <input
                    name="sku"
                    placeholder="e.g. TSHIRT-001"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Price (LKR) *</label>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Stock Qty</label>
                  <input
                    name="stock_qty"
                    type="number"
                    min={0}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Display Order</label>
                  <input
                    name="display_order"
                    type="number"
                    min={0}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Image URL</label>
                  <input
                    name="image_url"
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description (English)</label>
                  <textarea
                    name="description"
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description (Sinhala)</label>
                  <textarea
                    name="description_si"
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="border-t border-slate-100 pt-3 mt-3">
                  <label className="block text-xs font-medium text-slate-700 mb-3">Variants (Optional)</label>
                  {createVariants.map((variant, idx) => (
                    <div key={idx} className="mb-3">
                      <label className="block text-xs font-medium text-slate-600 capitalize mb-1">{variant.type}</label>
                      <input
                        type="text"
                        placeholder="Enter options separated by commas (e.g. S, M, L, XL)"
                        value={variant.options.join(', ')}
                        onChange={(e) => {
                          const newVariants = [...createVariants]
                          newVariants[idx].options = e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                          setCreateVariants(newVariants)
                        }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Item'}
                </button>
              </div>
            </form>
          )}

          {canManageMerchandise && editingItem && (
            <div className="bg-white rounded-xl border-2 border-blue-300 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Edit Item</h3>
                <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Name (English) *</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Name (Sinhala)</label>
                  <input
                    value={editNameSi}
                    onChange={(e) => setEditNameSi(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">SKU</label>
                  <input
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Price (LKR) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={editStockQty}
                    onChange={(e) => setEditStockQty(Number(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={editDisplayOrder}
                    onChange={(e) => setEditDisplayOrder(Number(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Image URL</label>
                  <input
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description (English)</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Description (Sinhala)</label>
                  <textarea
                    value={editDescriptionSi}
                    onChange={(e) => setEditDescriptionSi(e.target.value)}
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="border-t border-slate-100 pt-3 mt-3">
                  <label className="block text-xs font-medium text-slate-700 mb-3">Variants (Optional)</label>
                  {editVariants.map((variant, idx) => (
                    <div key={idx} className="mb-3">
                      <label className="block text-xs font-medium text-slate-600 capitalize mb-1">{variant.type}</label>
                      <input
                        type="text"
                        placeholder="Enter options separated by commas (e.g. S, M, L, XL)"
                        value={variant.options.join(', ')}
                        onChange={(e) => {
                          const newVariants = [...editVariants]
                          newVariants[idx].options = e.target.value.split(',').map(o => o.trim()).filter(Boolean)
                          setEditVariants(newVariants)
                        }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-medium text-slate-500">Item Active</label>
                  <button
                    type="button"
                    onClick={() => setEditActive(!editActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editActive ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        editActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleUpdate}
                    disabled={saving || !editName.trim() || !editPrice}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
