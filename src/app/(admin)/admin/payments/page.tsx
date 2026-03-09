'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatLKR } from '@/lib/utils'
import { Plus, Eye, TrendingUp } from 'lucide-react'

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all')

  const enriched = MOCK_PAYMENTS.map(p => ({
    ...p,
    student: MOCK_STUDENTS.find(s => s.id === p.studentId),
  }))

  const filtered = statusFilter === 'all' ? enriched : enriched.filter(p => p.status === statusFilter)
  const totalPaid = MOCK_PAYMENTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = MOCK_PAYMENTS.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Payment records and revenue tracking"
        actions={
          <Link href="/admin/payments/record" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Record Payment
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-green-600">{formatLKR(totalPaid)}</p>
          <div className="flex items-center gap-1 text-xs text-green-500 mt-1"><TrendingUp className="w-3 h-3" />+15% this month</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Pending Collection</p>
          <p className="text-2xl font-bold text-orange-600">{formatLKR(totalPending)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-800">{MOCK_PAYMENTS.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <span className="text-sm text-slate-400">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Receipt No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.receiptNo}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-700">{p.student?.fullName}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.student?.studentId}</p>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-800">{formatLKR(p.amount)}</td>
                  <td className="px-5 py-3 text-slate-500 capitalize">{p.method.replace('_', ' ')}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{p.paidAt ? formatDate(p.paidAt) : `Due: ${formatDate(p.dueDate || '')}`}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/payments/${p.id}`} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
