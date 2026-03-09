'use client'

import { useAuthStore } from '@/store/authStore'
import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments'
import { MOCK_RESULTS } from '@/lib/mock-data/results'
import { MOCK_CERTIFICATES } from '@/lib/mock-data/certificates'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { useStudentPortalStore } from '@/store/studentPortalStore'
import { formatLKR, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { BookOpen, CreditCard, FileText, Award, Bell, ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function PortalDashboardPage() {
  const { user } = useAuthStore()
  const { notifications, markAsRead } = useStudentPortalStore()

  const myEnrollments = MOCK_ENROLLMENTS.filter(e => e.studentId === 's1')
  const myPayments = MOCK_PAYMENTS.filter(p => p.studentId === 's1')
  const myResults = MOCK_RESULTS.filter(r => r.studentId === 's1' && r.isPublished)
  const myCerts = MOCK_CERTIFICATES.filter(c => c.studentId === 's1' && !c.isRevoked)
  const unreadNotifs = notifications.filter(n => !n.isRead)

  const paidAmount = myPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pendingAmount = myPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const nextDue = myPayments.find(p => p.status === 'pending')

  const summaryCards = [
    { icon: BookOpen, label: 'Enrolled Courses', value: myEnrollments.length, href: '/portal/courses', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: CreditCard, label: 'Outstanding Balance', value: formatLKR(pendingAmount), href: '/portal/payments', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: FileText, label: 'Results Available', value: myResults.length, href: '/portal/results', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Award, label: 'Certificates', value: myCerts.length, href: '/portal/certificates', color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div>
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm mb-1">{getGreeting()},</p>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>{user?.name}</h1>
            <p className="text-orange-100 text-sm mt-1">Student ID: {user?.studentId}</p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-orange-100 text-xs">Currently enrolled in</p>
            <p className="text-white font-semibold text-sm">
              {myEnrollments.length > 0
                ? MOCK_COURSES.find(c => c.id === myEnrollments[0].courseId)?.name?.split(' ').slice(0, 2).join(' ')
                : 'No active courses'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.href} href={card.href} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow group">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-xl font-bold text-stone-800">{card.value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{card.label}</div>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrolled courses */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">My Courses</h3>
            <Link href="/portal/courses" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {myEnrollments.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-6">No courses enrolled yet.</p>
          ) : (
            <div className="space-y-3">
              {myEnrollments.map(e => {
                const course = MOCK_COURSES.find(c => c.id === e.courseId)
                return (
                  <div key={e.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-700 truncate">{course?.name}</p>
                      <p className="text-xs text-stone-400">Enrolled: {formatDate(e.enrolledAt)}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Payment Summary</h3>
            <Link href="/portal/payments" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2 border-b border-stone-50">
              <span className="text-sm text-stone-500">Amount Paid</span>
              <span className="text-sm font-semibold text-green-600">{formatLKR(paidAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-50">
              <span className="text-sm text-stone-500">Outstanding Balance</span>
              <span className="text-sm font-semibold text-orange-600">{formatLKR(pendingAmount)}</span>
            </div>
            {nextDue && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-stone-500">Next Due Date</span>
                <span className="text-sm font-medium text-stone-700">{formatDate(nextDue.dueDate || '')}</span>
              </div>
            )}
          </div>
          {pendingAmount > 0 && (
            <Link href="/portal/payments" className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Pay Now
            </Link>
          )}
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-700">Recent Notifications</h3>
            <Link href="/portal/notifications" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 4).map(notif => (
              <button
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors ${!notif.isRead ? 'bg-orange-50' : 'hover:bg-stone-50'}`}
              >
                <Bell className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notif.isRead ? 'text-stone-300' : 'text-orange-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notif.isRead ? 'text-stone-500' : 'text-stone-700'}`}>{notif.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5 truncate">{notif.message}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
