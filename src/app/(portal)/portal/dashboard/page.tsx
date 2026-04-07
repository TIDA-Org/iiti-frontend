'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { apiGetMyResults, apiGetMyCertificates } from '@/lib/api'
import Link from 'next/link'
import { BookOpen, CreditCard, FileText, Award, Bell, ArrowRight } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function PortalDashboardPage() {
  const { user } = useAuthStore()
  const [resultsCount, setResultsCount] = useState(0)
  const [certsCount, setCertsCount] = useState(0)

  useEffect(() => {
    apiGetMyResults(1, 1).then(d => setResultsCount(d.total)).catch(() => {})
    apiGetMyCertificates(1, 1).then(d => setCertsCount(d.total)).catch(() => {})
  }, [])

  const summaryCards = [
    { icon: BookOpen, label: 'Enrolled Courses', value: '—', href: '/portal/courses', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: CreditCard, label: 'Outstanding Balance', value: '—', href: '/portal/payments', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: FileText, label: 'Results Available', value: resultsCount, href: '/portal/results', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Award, label: 'Certificates', value: certsCount, href: '/portal/certificates', color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div>
      {/* Welcome banner */}
      <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-orange-100 text-xs md:text-sm mb-1">{getGreeting()},</p>
            <h1 className="text-xl md:text-2xl font-bold">{user?.name}</h1>
            <p className="text-orange-100 text-xs md:text-sm mt-1">Student ID: {user?.studentId}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.href} href={card.href} className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-3 md:p-4 hover:shadow-md transition-all duration-200 group">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-lg md:text-xl font-bold text-slate-800">{card.value}</div>
              <div className="text-xs md:text-sm text-slate-500 mt-0.5">{card.label}</div>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Enrolled courses */}
        <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 text-sm md:text-base">My Courses</h3>
            <Link href="/portal/courses" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <p className="text-sm text-slate-400 text-center py-6">Course data will be available once the enrollment API is connected.</p>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 text-sm md:text-base">Payment Summary</h3>
            <Link href="/portal/payments" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <p className="text-sm text-slate-400 text-center py-6">Payment data will be available once the payments API is connected.</p>
        </div>

        {/* Recent notifications placeholder */}
        <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-5 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 text-sm md:text-base">Recent Notifications</h3>
            <Link href="/portal/notifications" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="text-center py-6">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No notifications yet</p>
          </div>
        </div>
      </div>
    </div>
  )
}
