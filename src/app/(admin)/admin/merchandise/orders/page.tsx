'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  apiGetAllMerchandiseOrders,
  apiGetMerchandiseOrder,
  apiUpdateMerchandiseOrderStatus,
  MerchandiseOrderApiResponse,
} from '@/lib/api/merchandise'
import { useApi } from '@/hooks/useApi'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ShoppingCart, Check, X } from 'lucide-react'
import { toast } from 'sonner'

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'blue' },
  { value: 'processing', label: 'Processing', color: 'purple' },
  { value: 'ready', label: 'Ready', color: 'green' },
  { value: 'collected', label: 'Collected', color: 'slate' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
]

export default function AdminMerchandiseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [selectedOrder, setSelectedOrder] = useState<MerchandiseOrderApiResponse | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [updateNotes, setUpdateNotes] = useState('')

  const { hasPermission } = usePermissionAccess()
  const canManageMerchandise = hasPermission('merchandise.manage')

  const { data: ordersData, isLoading, error, refetch } = useApi<any>(
    () => apiGetAllMerchandiseOrders(1, 50, statusFilter),
    []
  )

  const orders = ordersData?.items || []

  useEffect(() => {
    if (!canManageMerchandise) {
      setSelectedOrder(null)
    }
  }, [canManageMerchandise])

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return
    setUpdatingStatus(true)
    try {
      await apiUpdateMerchandiseOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: updateNotes || null,
      })
      toast.success('Order status updated')
      setSelectedOrder(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSelectOrder = (order: MerchandiseOrderApiResponse) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setUpdateNotes(order.notes || '')
  }

  return (
    <div>
      <PageHeader
        title="Merchandise Orders"
        subtitle={orders ? `${orders.length} orders` : 'Loading...'}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Filter by Status</label>
                <select
                  value={statusFilter || ''}
                  onChange={(e) => setStatusFilter(e.target.value || undefined)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-slate-400">{orders.length} results</span>
            </div>
            <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
              {orders.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={ShoppingCart}
                    title="No merchandise orders"
                    description="Orders will appear here when students place them."
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map((order: MerchandiseOrderApiResponse) => (
                    <button
                      key={order.id}
                      onClick={() => handleSelectOrder(order)}
                      className={`w-full text-left px-5 py-4 transition-colors ${
                        selectedOrder?.id === order.id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900">{order.order_number}</h4>
                          <p className="text-xs text-slate-500">
                            {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''} · LKR{' '}
                            {order.total_amount.toFixed(2)}
                          </p>
                          {order.notes && <p className="text-xs text-slate-400 line-clamp-1">{order.notes}</p>}
                        </div>
                        <div className="text-right">
                          <StatusBadge status={order.status} />
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(order.ordered_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </DataLoader>
          </div>
        </div>

        {/* Side Panel - Order Details */}
        <div className="lg:col-span-1">
          {canManageMerchandise && selectedOrder && (
            <div className="bg-white rounded-xl border-2 border-blue-300 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div>
                  <p className="text-xs font-medium text-slate-500">Order Number</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedOrder.order_number}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Student ID</p>
                  <p className="text-sm text-slate-700">{selectedOrder.student_id}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Total Amount</p>
                  <p className="text-lg font-semibold text-slate-900">
                    LKR {selectedOrder.total_amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Current Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Ordered</p>
                  <p className="text-sm text-slate-700">
                    {new Date(selectedOrder.ordered_at).toLocaleString()}
                  </p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Notes</p>
                    <p className="text-sm text-slate-700">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase">Items ({selectedOrder.order_items.length})</p>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-900">{item.item?.name || 'Unknown Item'}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-slate-600">
                          Qty: {item.quantity} × LKR {item.unit_price.toFixed(2)}
                        </p>
                        <p className="text-xs font-semibold text-slate-900">LKR {item.subtotal.toFixed(2)}</p>
                      </div>
                      {item.variant_selected && (
                        <p className="text-xs text-slate-500 mt-1">
                          {Object.entries(item.variant_selected)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Update Notes</label>
                  <textarea
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. Payment verified, ready for pickup..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleStatusChange}
                  disabled={updatingStatus || newStatus === selectedOrder.status}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
