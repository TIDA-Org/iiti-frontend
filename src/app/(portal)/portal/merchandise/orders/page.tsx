'use client'

import { useState } from 'react'
import { apiGetMyMerchandiseOrders, MerchandiseOrderApiResponse } from '@/lib/api/merchandise'
import { useApi } from '@/hooks/useApi'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ShoppingCart, ChevronDown } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'

const STATUS_COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  paid: { bg: 'bg-blue-50', text: 'text-blue-700' },
  processing: { bg: 'bg-purple-50', text: 'text-purple-700' },
  ready: { bg: 'bg-green-50', text: 'text-green-700' },
  collected: { bg: 'bg-slate-50', text: 'text-slate-700' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
}

export default function StudentMerchandiseOrdersPage() {
  const { t, isSinhala } = useTranslation()
  const [selectedOrder, setSelectedOrder] = useState<MerchandiseOrderApiResponse | null>(null)

  const { data: ordersData, isLoading, error, refetch } = useApi<any>(
    () => apiGetMyMerchandiseOrders(1, 50),
    []
  )

  const orders = ordersData?.items || []

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t.merchandise.statusPending
      case 'paid': return t.merchandise.statusPaid
      case 'processing': return t.merchandise.statusProcessing
      case 'ready': return t.merchandise.statusReady
      case 'collected': return t.merchandise.statusCollected
      case 'cancelled': return t.merchandise.statusCancelled
      default: return status
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return t.merchandise.statusMsgPending
      case 'paid': return t.merchandise.statusMsgPaid
      case 'processing': return t.merchandise.statusMsgProcessing
      case 'ready': return t.merchandise.statusMsgReady
      case 'collected': return t.merchandise.statusMsgCollected
      case 'cancelled': return t.merchandise.statusMsgCancelled
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t.merchandise.ordersTitle}</h1>
        <p className="mt-1 text-slate-600">{t.merchandise.ordersSubtitle}</p>
      </div>

      <div className="space-y-4">
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12">
              <EmptyState
                icon={ShoppingCart}
                title={t.merchandise.noOrdersYet}
                description={t.merchandise.noOrdersDesc}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: typeof orders[0]) => {
                const colorConfig = STATUS_COLOR_CLASSES[order.status] || { bg: 'bg-slate-50', text: 'text-slate-700' }
                const statusLabel = getStatusLabel(order.status)
                const itemsCountText = `${order.order_items.length} ${order.order_items.length !== 1 ? t.merchandise.itemsUnit : t.merchandise.itemUnit}`

                return (
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
                          {itemsCountText} · {t.merchandise.total}: {t.common.currency}{' '}
                          {order.total_amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {t.merchandise.orderedOn}: {new Date(order.ordered_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorConfig.bg} ${colorConfig.text}`}>
                            {statusLabel}
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
                            <p className="text-xs font-medium text-slate-500">{t.merchandise.orderStatus}</p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">
                              {statusLabel}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500">{t.merchandise.totalAmount}</p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">
                              {t.common.currency} {order.total_amount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500">{t.merchandise.orderedDate}</p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">
                              {new Date(order.ordered_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {order.notes && (
                          <div>
                            <p className="text-xs font-medium text-slate-500">{t.courses.notes}</p>
                            <p className="text-sm text-slate-700 mt-1">{order.notes}</p>
                          </div>
                        )}

                        {/* Order Items */}
                        <div>
                          <p className="text-xs font-semibold text-slate-600 uppercase mb-3">
                            {t.merchandise.orderItems} ({order.order_items.length})
                          </p>
                          <div className="space-y-2 bg-white rounded-lg p-3 divide-y divide-slate-100">
                            {order.order_items.map((item: typeof order.order_items[0], idx: number) => {
                              const itemName = (isSinhala && item.item?.name_si) ? item.item.name_si : (item.item?.name || t.merchandise.unknownItem)
                              return (
                                <div key={idx} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900">
                                      {itemName}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                      {t.merchandise.quantity}: {item.quantity} × {t.common.currency} {item.unit_price.toFixed(2)}
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
                                      {t.common.currency} {item.subtotal.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Status Information */}
                        {getStatusMessage(order.status) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700">
                              {getStatusMessage(order.status)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </DataLoader>
      </div>
    </div>
  )
}
