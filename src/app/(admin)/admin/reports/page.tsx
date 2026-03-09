import { PageHeader } from '@/components/admin/layout/PageHeader'
import Link from 'next/link'
import { BarChart3, Users, CreditCard, Award } from 'lucide-react'

const REPORTS = [
  { href: '/admin/reports/enrollments', title: 'Enrollment Report', desc: 'Monthly and yearly enrollment statistics by course and batch.', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { href: '/admin/reports/payments', title: 'Payment Report', desc: 'Revenue collected, pending amounts, and payment method breakdown.', icon: CreditCard, color: 'text-green-500', bg: 'bg-green-50' },
  { href: '/admin/reports/completions', title: 'Completion Report', desc: 'Course completion rates, pass/fail statistics, and grade distribution.', icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
]

export default function AdminReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Analytics and reporting" />
      <div className="grid md:grid-cols-3 gap-6">
        {REPORTS.map(report => {
          const Icon = report.icon
          return (
            <Link key={report.href} href={report.href} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow group">
              <div className={`w-12 h-12 ${report.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <h3 className="font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{report.title}</h3>
              <p className="text-slate-500 text-sm">{report.desc}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
