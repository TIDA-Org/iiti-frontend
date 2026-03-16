'use client'

import { useState } from 'react'
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments'
import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { formatLKR, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'
import { delay } from '@/lib/utils'
import { CreditCard, Download } from 'lucide-react'

export default function PortalPaymentsPage() {
  const [paying, setPaying] = useState(false)
  const payments = MOCK_PAYMENTS.filter(p => p.studentId === 's1')
  const paid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const enrollment = MOCK_ENROLLMENTS.find(e => e.studentId === 's1')
  const course = MOCK_COURSES.find(c => c.id === enrollment?.courseId)
  const total = course?.fee || 0

  const handlePayNow = async () => {
    setPaying(true)
    await delay(1200)
    setPaying(false)
    toast.success('Payment simulation complete! In production, this redirects to PayHere.')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">Your payment history and upcoming dues</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-3 md:p-4">
          <p className="text-xs text-slate-400 mb-1">Total Course Fee</p>
          <p className="text-lg md:text-xl font-bold text-slate-800">{formatLKR(total)}</p>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl border border-green-200 p-3 md:p-4 bg-green-50">
          <p className="text-xs text-slate-400 mb-1">Amount Paid</p>
          <p className="text-lg md:text-xl font-bold text-green-600">{formatLKR(paid)}</p>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl border border-orange-200 p-3 md:p-4 bg-orange-50">
          <p className="text-xs text-slate-400 mb-1">Outstanding Balance</p>
          <p className="text-lg md:text-xl font-bold text-orange-600">{formatLKR(pending)}</p>
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 overflow-hidden mb-4">
        <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700 text-sm md:text-base">Payment History</h3>
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Receipt No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{p.receiptNo}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{formatLKR(p.amount)}</td>
                  <td className="px-5 py-3 text-slate-500 capitalize">{p.method.replace('_', ' ')}</td>
                  <td className="px-5 py-3 text-slate-500">{p.paidAt ? formatDate(p.paidAt) : p.dueDate ? `Due: ${formatDate(p.dueDate)}` : '-'}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3">
                    {p.status === 'paid' && (
                      <button onClick={() => toast.info('Receipt download simulated')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden">
          <div className="divide-y divide-slate-100">
            {payments.map(p => (
              <div key={p.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Receipt No</span>
                  <span className="font-mono text-xs font-semibold text-slate-600">{p.receiptNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Amount</span>
                  <span className="font-semibold text-slate-800">{formatLKR(p.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Method</span>
                  <span className="text-xs text-slate-500 capitalize">{p.method.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Date</span>
                  <span className="text-xs text-slate-500">{p.paidAt ? formatDate(p.paidAt) : p.dueDate ? `Due: ${formatDate(p.dueDate)}` : '-'}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Status</span>
                  <StatusBadge status={p.status} />
                </div>
                {p.status === 'paid' && (
                  <button onClick={() => toast.info('Receipt download simulated')} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 mt-2 font-medium w-full justify-center py-1.5 border border-orange-100 rounded">
                    <Download className="w-3.5 h-3.5" /> Download Receipt
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {pending > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg md:rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-800 text-sm md:text-base">Outstanding Balance: {formatLKR(pending)}</p>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Make a payment to keep your enrollment active.</p>
          </div>
          <button
            onClick={handlePayNow}
            disabled={paying}
            className="flex items-center justify-center sm:justify-start gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-semibold text-xs md:text-sm transition-colors flex-shrink-0"
          >
            {paying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</span> : <><CreditCard className="w-4 h-4" /> Pay Now</>}
          </button>
        </div>
      )}
    </div>
  )
}
