'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  apiGetMerchandiseItems,
  apiCreateMerchandiseOrder,
  MerchandiseItemApiResponse,
} from '@/lib/api/merchandise'
import { useApi } from '@/hooks/useApi'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ShoppingBag, ShoppingCart, Plus, Minus, X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CartItem {
  itemId: string
  quantity: number
  variantSelected?: Record<string, any>
}

export default function StudentMerchandiseCartPage() {
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map())
  const [selectedItem, setSelectedItem] = useState<MerchandiseItemApiResponse | null>(null)
  const [addingQty, setAddingQty] = useState(1)
  const [addingVariants, setAddingVariants] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [orderNotes, setOrderNotes] = useState('')

  const { data: itemsData, isLoading, error, refetch } = useApi<any>(
    () => apiGetMerchandiseItems(1, 100),
    []
  )

  const items = itemsData?.items || []

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('merch_cart')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCart(new Map(Object.entries(parsed)))
      } catch (e) {
        console.warn('Failed to load cart', e)
      }
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('merch_cart', JSON.stringify(Object.fromEntries(cart)))
  }, [cart])

  const handleAddToCart = () => {
    if (!selectedItem) return

    const cartKey = selectedItem.id
    const existingItem = cart.get(cartKey)

    const newCartItem: CartItem = {
      itemId: selectedItem.id,
      quantity: (existingItem?.quantity || 0) + addingQty,
      variantSelected: Object.keys(addingVariants).length > 0 ? addingVariants : undefined,
    }

    const newCart = new Map(cart)
    newCart.set(cartKey, newCartItem)
    setCart(newCart)

    toast.success(`${selectedItem.name} added to cart`)
    setSelectedItem(null)
    setAddingQty(1)
    setAddingVariants({})
  }

  const handleRemoveFromCart = (itemId: string) => {
    const newCart = new Map(cart)
    newCart.delete(itemId)
    setCart(newCart)
  }

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty < 1) {
      handleRemoveFromCart(itemId)
      return
    }
    const newCart = new Map(cart)
    const item = newCart.get(itemId)
    if (item) {
      item.quantity = newQty
      newCart.set(itemId, item)
      setCart(newCart)
    }
  }

  const handleSubmitOrder = async () => {
    if (cart.size === 0) {
      toast.error('Cart is empty')
      return
    }

    setSubmitting(true)
    try {
      const orderItems = Array.from(cart.values()).map((cartItem) => ({
        item_id: cartItem.itemId,
        quantity: cartItem.quantity,
        variant_selected: cartItem.variantSelected,
      }))

      await apiCreateMerchandiseOrder({
        order_items: orderItems,
        notes: orderNotes || null,
      })

      toast.success('Order placed successfully!')
      setCart(new Map())
      localStorage.removeItem('merch_cart')
      setOrderNotes('')

      // Redirect to orders page after a brief delay
      setTimeout(() => {
        window.location.href = '/portal/merchandise/orders'
      }, 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  const cartItems = Array.from(cart.values())
  const cartTotal = items.reduce((sum: number, item: MerchandiseItemApiResponse) => {
    const cartItem = cart.get(item.id)
    return sum + (cartItem ? item.price * cartItem.quantity : 0)
  }, 0)
  const cartItemCount = Array.from(cart.values()).reduce((sum: number, item: CartItem) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Merchandise Store</h1>
        <p className="mt-1 text-slate-600">Browse and order merchandise items</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Available Items</h2>
            </div>
            <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
              {items.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={ShoppingBag}
                    title="No items available"
                    description="No merchandise items are currently available for order."
                  />
                </div>
              ) : (
                <div className="grid gap-4 p-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item: MerchandiseItemApiResponse) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item)
                        setAddingQty(1)
                        setAddingVariants({})
                      }}
                      className="text-left bg-white rounded-xl shadow-sm hover:shadow-lg border border-slate-100 overflow-hidden transition-all duration-200 hover:border-orange-200 group"
                    >
                      {/* Image Container */}
                      <div className="relative bg-slate-100 h-48 overflow-hidden">
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        )}
                        {/* Stock Badge */}
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          item.stock_qty > 0 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}>
                          {item.stock_qty > 0 ? `${item.stock_qty} in stock` : 'Out of stock'}
                        </div>
                      </div>

                      {/* Content Container */}
                      <div className="p-4 space-y-3">
                        {/* Title */}
                        <div>
                          <h3 className="font-bold text-slate-900 text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {item.name}
                          </h3>
                          {item.name_si && (
                            <p className="text-xs text-slate-500 mt-1">{item.name_si}</p>
                          )}
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                        )}

                        {/* Price & Action */}
                        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Price</p>
                            <p className="text-lg font-bold text-orange-600">LKR {item.price.toFixed(2)}</p>
                          </div>
                          <button className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-150 flex items-center gap-1 shadow-md hover:shadow-lg shrink-0">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </DataLoader>
          </div>
        </div>

        {/* Cart Summary & Details Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Item Details Panel */}
          {selectedItem && (
            <div className="bg-white rounded-xl border-2 border-orange-300 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Add to Cart</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedItem.name}</p>
                  {selectedItem.name_si && <p className="text-xs text-slate-600">{selectedItem.name_si}</p>}
                  <p className="text-lg font-bold text-orange-600 mt-2">LKR {selectedItem.price.toFixed(2)}</p>
                  {selectedItem.description && (
                    <p className="text-xs text-slate-600 mt-2">{selectedItem.description}</p>
                  )}
                </div>

                {selectedItem.variants && Array.isArray(selectedItem.variants) && selectedItem.variants.length > 0 && (
                  <div className="space-y-4 py-4 border-y border-slate-200">
                    {selectedItem.variants.map((variant: any) => (
                      <div key={variant.type}>
                        <label className="text-xs font-medium text-slate-700 capitalize block mb-2">
                          {variant.type}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(variant.options) ? variant.options : []).map((option: string) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={variant.type}
                                value={option}
                                checked={addingVariants[variant.type] === option}
                                onChange={(e) =>
                                  setAddingVariants({
                                    ...addingVariants,
                                    [variant.type]: e.target.value,
                                  })
                                }
                                className="w-4 h-4 text-orange-500 cursor-pointer"
                              />
                              <span className="text-sm text-slate-700 font-medium">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddingQty(Math.max(1, addingQty - 1))}
                      className="px-2 py-1 border border-orange-300 rounded hover:bg-orange-50 text-orange-600 font-semibold transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={addingQty}
                      onChange={(e) => setAddingQty(Math.max(1, Number(e.target.value) || 1))}
                      min={1}
                      max={selectedItem.stock_qty}
                      className="flex-1 text-center border-2 border-orange-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                    <button
                      onClick={() => setAddingQty(Math.min(selectedItem.stock_qty, addingQty + 1))}
                      className="px-2 py-1 border border-orange-300 rounded hover:bg-orange-50 text-orange-600 font-semibold transition-colors"
                      disabled={addingQty >= selectedItem.stock_qty}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Available: {selectedItem.stock_qty}</p>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={selectedItem.stock_qty < 1}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          {/* Cart Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping Cart ({cartItemCount})
            </h3>

            {cartItems.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 max-h-64 overflow-y-auto">
                  {cartItems.map((cartItem) => {
                    const item = items.find((i: MerchandiseItemApiResponse) => i.id === cartItem.itemId)
                    if (!item) return null
                    return (
                      <div key={cartItem.itemId} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-slate-600">
                            {cartItem.quantity} × LKR {item.price.toFixed(2)}
                          </p>
                          {cartItem.variantSelected && (
                            <p className="text-xs text-slate-500 mt-1">
                              {Object.entries(cartItem.variantSelected)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' • ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="text-xs text-slate-500">
                              LKR {(item.price * cartItem.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(cartItem.itemId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Notes (Optional)</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Special requests or notes..."
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="bg-slate-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Total Items:</span>
                      <span className="font-semibold text-slate-900">{cartItemCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Total:</span>
                      <span className="text-xl font-bold text-blue-600">LKR {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting || cartItems.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
