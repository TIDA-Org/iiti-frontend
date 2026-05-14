'use client'

import { useState } from 'react'
import { apiGetMyMerchandiseOrders, apiGetMerchandiseOrder, MerchandiseOrderApiResponse } from '@/lib/api/merchandise'
import { useApi } from '@/hooks/useApi'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ShoppingCart, ChevronDown, X } from 'lucide-react'

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
  paid: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Payment Received' },
  processing: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Processing' },
  ready: { bg: 'bg-green-50', text: 'text-green-700', label: 'Ready for Pickup' },
  collected: { bg: 'bg-slate-50', text: 'text-slate-700', label: 'Collected' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
}

export default function StudentMerchandiseOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<MerchandiseOrderApiResponse | null>(null)

  const { data: ordersData, isLoading, error, refetch } = useApi<any>(
    () => apiGetMyMerchandiseOrders(1, 50),
    []
  )

  const orders = ordersData?.items || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-1 text-slate-600">View your merchandise orders and track their status</p>
      </div>

      <div className="space-y-4">
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12">
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="You haven't placed any merchandise orders. Visit the store to browse and order items."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: typeof orders[0]) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  className="w-full text-left bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
                >
                  {/* Main Order Row */}
                  <div className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{order.order_number}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''} · Total: LKR{' '}
                        {order.total_amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Ordered: {new Date(order.ordered_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                          {statusColors[order.status]?.label || order.status}
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          selectedOrder?.id === order.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedOrder?.id === order.id && (
                    <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-medium text-slate-500">Status</p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            {statusColors[order.status]?.label || order.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500">Total Amount</p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            LKR {order.total_amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500">Ordered Date</p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            {new Date(order.ordered_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {order.notes && (
                        <div>
                          <p className="text-xs font-medium text-slate-500">Notes</p>
                          <p className="text-sm text-slate-700 mt-1">{order.notes}</p>
                        </div>
                      )}

                      {/* Order Items */}
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-3">
                          Items ({order.order_items.length})
                        </p>
                        <div className="space-y-2 bg-white rounded-lg p-3 divide-y divide-slate-100">
                          {order.order_items.map((item: typeof order.order_items[0], idx: number) => (
                            <div key={idx} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900">
                                  {item.item?.name || 'Unknown Item'}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Qty: {item.quantity} × LKR {item.unit_price.toFixed(2)}
                                </p>
                                {item.variant_selected && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    {Object.entries(item.variant_selected)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(' • ')}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">
                                  LKR {item.subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Information */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                          {order.status === 'pending' && (
                            'Your order is pending. Please wait for admin confirmation and payment verification.'
                          )}
                          {order.status === 'paid' && (
                            'Payment has been received. Your order is being prepared.'
                          )}
                          {order.status === 'processing' && (
                            'Your order is being processed and prepared for pickup.'
                          )}
                          {order.status === 'ready' && (
                            'Your order is ready for pickup. Please collect it at the IITI office during business hours.'
                          )}
                          {order.status === 'collected' && (
                            'Your order has been collected. Thank you for your purchase!'
                          )}
                          {order.status === 'cancelled' && (
                            'This order has been cancelled. Please contact admin for details.'
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </DataLoader>
      </div>
    </div>
  )
}
