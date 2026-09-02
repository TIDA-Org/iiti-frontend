'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { PaymentsTable } from '@/components/admin/tables/PaymentsTable'
import { PaymentApiResponse, PaymentListApiResponse } from '@/types/payment'
import { apiGetPayments, apiGetPayment } from '@/lib/api/payments'
import { Pagination } from '@/components/shared/Pagination'
import { Receipt, Plus, Search, X, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentListApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 20

  // Receipt number search state
  const [receiptSearch, setReceiptSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchResult, setSearchResult] = useState<PaymentApiResponse | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  const load = useCallback(async (p: number) => {
    setIsLoading(true)
    try {
      const res = await apiGetPayments(p, perPage)
      setData(res)
    } catch {
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const handleReceiptUpdated = (updated: PaymentApiResponse) => {
    if (!data) return
    setData({
      ...data,
      items: data.items.map((p) => (p.id === updated.id ? updated : p)),
    })
    if (searchResult?.id === updated.id) setSearchResult(updated)
  }

  // Search by receipt number
  const handleSearch = async () => {
    const trimmed = searchInput.trim()
    if (!trimmed) return
    setSearching(true)
    setSearchError(null)
    setSearchResult(null)
    setReceiptSearch(trimmed)
    try {
      // We brute-force search by fetching all pages and matching receipt_number
      // In production you'd add a backend query param; for now we scan the first 5 pages
      let found: PaymentApiResponse | null = null
      for (let p = 1; p <= 5 && !found; p++) {
        const res = await apiGetPayments(p, 50)
        found = res.items.find(pay => pay.receipt_number === trimmed) ?? null
        if (res.pages <= p) break
      }
      if (found) {
        // Fetch full detail
        const detail = await apiGetPayment(found.id)
        setSearchResult(detail)
      } else {
        setSearchError(`No payment found with receipt number "${trimmed}".`)
      }
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : 'Search failed.')
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchInput('')
    setReceiptSearch('')
    setSearchResult(null)
    setSearchError(null)
  }

  // Summary counts
  const completed = data?.items.filter(p => p.payment_status === 'completed').length ?? 0
  const underReview = data?.items.filter(p => p.payment_status === 'under_review').length ?? 0

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="All payment records and revenue tracking"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/payments/receipts"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <Receipt className="w-4 h-4" />
              Receipt Queue
            </Link>
            <Link
              href="/admin/payments/record"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Record Cash Payment
            </Link>
          </div>
        }
      />

      {/* Summary cards */}
      {data && Array.isArray(data.items) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Records</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{data.total ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{completed}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Under Review</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{underReview}</p>
          </div>
        </div>
      )}

      {/* Receipt Number Lookup */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Find Payment by Receipt Number
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. RCP-2026-00042"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchInput.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-50 transition-colors"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
          {receiptSearch && (
            <button onClick={clearSearch} className="p-2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchError && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {searchError}
          </div>
        )}

        {searchResult && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-green-700 mb-2">✅ Found: {searchResult.receipt_number}</p>
            <PaymentsTable
              payments={[searchResult]}
              onPaymentUpdated={(updated) => {
                setSearchResult(updated)
                toast.success('Payment updated.')
                load(page)
              }}
            />
          </div>
        )}
      </div>

      <PaymentsTable
        payments={Array.isArray(data?.items) ? data.items : []}
        isLoading={isLoading}
        onPaymentUpdated={handleReceiptUpdated}
      />

      {data && data.pages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={data.pages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
