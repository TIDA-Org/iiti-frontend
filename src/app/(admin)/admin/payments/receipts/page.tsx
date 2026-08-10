'use client'

import { useEffect, useState, useCallback } from 'react'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { ReceiptsTable } from '@/components/admin/tables/ReceiptsTable'
import { ReceiptApiResponse, ReceiptListApiResponse } from '@/types/receipt'
import { apiGetPendingReceipts, apiGetVerifiedReceipts } from '@/lib/api/receipts'
import { Pagination } from '@/components/shared/Pagination'
import { ArrowLeft, Inbox, CheckCircle2, History } from 'lucide-react'
import Link from 'next/link'

export default function AdminReceiptsQueuePage() {
  // ── Pending queue ──────────────────────────────────────────────────
  const [pendingData, setPendingData] = useState<ReceiptListApiResponse | null>(null)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [pendingPage, setPendingPage] = useState(1)
  const perPage = 20

  // ── Verified history ───────────────────────────────────────────────
  const [verifiedData, setVerifiedData] = useState<ReceiptListApiResponse | null>(null)
  const [verifiedLoading, setVerifiedLoading] = useState(true)
  const [verifiedPage, setVerifiedPage] = useState(1)

  const loadPending = useCallback(async (p: number) => {
    setPendingLoading(true)
    try {
      const res = await apiGetPendingReceipts(p, perPage)
      setPendingData(res)
    } catch {
      setPendingData(null)
    } finally {
      setPendingLoading(false)
    }
  }, [])

  const loadVerified = useCallback(async (p: number) => {
    setVerifiedLoading(true)
    try {
      // Fetch all receipts (not filtered by status) — backend returns all, we show non-pending
      const res = await apiGetVerifiedReceipts(p, perPage)
      // Filter to only approved/rejected on the client side
      const filtered = {
        ...res,
        items: res.items.filter((r) => r.status === 'approved' || r.status === 'rejected'),
      }
      setVerifiedData(filtered)
    } catch {
      setVerifiedData(null)
    } finally {
      setVerifiedLoading(false)
    }
  }, [])

  useEffect(() => { loadPending(pendingPage) }, [pendingPage, loadPending])
  useEffect(() => { loadVerified(verifiedPage) }, [verifiedPage, loadVerified])

  const handleReceiptUpdated = (updated: ReceiptApiResponse) => {
    // Remove from pending queue
    setPendingData((prev) => prev
      ? { ...prev, items: prev.items.filter((r) => r.id !== updated.id), total: Math.max(0, prev.total - 1) }
      : prev
    )
    // Refresh verified list to include the newly verified receipt
    loadVerified(verifiedPage)
  }

  const pendingCount = pendingData?.total ?? 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Receipt Verification"
        subtitle="Review uploaded bank deposit slips and manage verification"
        actions={
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Link>
        }
      />

      {/* ── Pending Queue ───────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Receipt Verification Queue</h2>
            <p className="text-xs text-slate-500">Bank slips awaiting your review</p>
          </div>
          {pendingCount > 0 && (
            <span className="ml-auto text-xs font-bold bg-amber-500 text-white px-2.5 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>

        {pendingCount === 0 && !pendingLoading ? (
          <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>All caught up! No pending bank slips to review.</span>
          </div>
        ) : (
          <>
            <ReceiptsTable
              receipts={pendingData?.items.filter(r => r.status === 'uploaded') ?? []}
              isLoading={pendingLoading}
              onReceiptUpdated={handleReceiptUpdated}
            />
            {pendingData && pendingData.pages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={pendingPage}
                  totalPages={pendingData.pages}
                  onPageChange={setPendingPage}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Verified History ────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <History className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Verified Receipts History</h2>
            <p className="text-xs text-slate-500">Approved and rejected slips in chronological order</p>
          </div>
          {verifiedData && (
            <span className="ml-auto text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {verifiedData.items.length} records
            </span>
          )}
        </div>

        <ReceiptsTable
          receipts={verifiedData?.items ?? []}
          isLoading={verifiedLoading}
          hideAction
        />

        {verifiedData && verifiedData.pages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={verifiedPage}
              totalPages={verifiedData.pages}
              onPageChange={setVerifiedPage}
            />
          </div>
        )}
      </section>
    </div>
  )
}
