import { apiFetch } from './core'

export interface MerchandiseItemApiResponse {
  id: string
  name: string
  name_si: string | null
  description: string | null
  description_si: string | null
  sku: string | null
  price: number
  image_url: string | null
  variants: Record<string, any> | null
  stock_qty: number
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface MerchandiseOrderItemApiResponse {
  id: number
  order_id: string
  item_id: string
  quantity: number
  unit_price: number
  variant_selected: Record<string, any> | null
  subtotal: number
  item?: MerchandiseItemApiResponse
}

export interface MerchandiseOrderApiResponse {
  id: string
  student_id: string
  enrollment_id: string | null
  order_number: string
  total_amount: number
  status: string // pending, paid, processing, ready, collected, cancelled
  notes: string | null
  order_items: MerchandiseOrderItemApiResponse[]
  ordered_at: string
  updated_at: string
}

export interface MerchandiseItemListApiResponse {
  items: MerchandiseItemApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface MerchandiseOrderListApiResponse {
  items: MerchandiseOrderApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

// ── Items (Public) ──────────────────────────────────────────────

export async function apiGetMerchandiseItems(
  page: number = 1,
  perPage: number = 20
): Promise<MerchandiseItemListApiResponse> {
  const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() })
  return apiFetch(`/merchandise/items?${params.toString()}`)
}

export async function apiGetMerchandiseItem(itemId: string): Promise<MerchandiseItemApiResponse> {
  return apiFetch(`/merchandise/items/${itemId}`)
}

// ── Items (Admin) ───────────────────────────────────────────────

export async function apiCreateMerchandiseItem(data: {
  name: string
  name_si?: string | null
  description?: string | null
  description_si?: string | null
  sku?: string | null
  price: number
  image_url?: string | null
  variants?: Record<string, any> | null
  stock_qty?: number
  is_active?: boolean
  display_order?: number
}): Promise<MerchandiseItemApiResponse> {
  return apiFetch('/merchandise/items', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiUpdateMerchandiseItem(
  itemId: string,
  data: {
    name?: string
    name_si?: string | null
    description?: string | null
    description_si?: string | null
    sku?: string | null
    price?: number
    image_url?: string | null
    variants?: Record<string, any> | null
    stock_qty?: number
    is_active?: boolean
    display_order?: number
  }
): Promise<MerchandiseItemApiResponse> {
  return apiFetch(`/merchandise/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function apiDeleteMerchandiseItem(itemId: string): Promise<void> {
  return apiFetch(`/merchandise/items/${itemId}`, {
    method: 'DELETE',
  })
}

// ── Orders (Student) ────────────────────────────────────────────

export async function apiCreateMerchandiseOrder(data: {
  order_items: Array<{
    item_id: string
    quantity: number
    variant_selected?: Record<string, any> | null
  }>
  notes?: string | null
}): Promise<MerchandiseOrderApiResponse> {
  return apiFetch('/merchandise/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiGetMyMerchandiseOrders(
  page: number = 1,
  perPage: number = 20
): Promise<MerchandiseOrderListApiResponse> {
  const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() })
  return apiFetch(`/merchandise/orders/me?${params.toString()}`)
}

export async function apiGetMerchandiseOrder(orderId: string): Promise<MerchandiseOrderApiResponse> {
  return apiFetch(`/merchandise/orders/${orderId}`)
}

// ── Orders (Admin) ──────────────────────────────────────────────

export async function apiGetAllMerchandiseOrders(
  page: number = 1,
  perPage: number = 20,
  status?: string
): Promise<MerchandiseOrderListApiResponse> {
  const params = new URLSearchParams({ 
    page: page.toString(), 
    per_page: perPage.toString(),
    ...(status && { status })
  })
  return apiFetch(`/merchandise/orders?${params.toString()}`)
}

export async function apiUpdateMerchandiseOrderStatus(
  orderId: string,
  data: {
    status: string
    notes?: string | null
  }
): Promise<MerchandiseOrderApiResponse> {
  return apiFetch(`/merchandise/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
