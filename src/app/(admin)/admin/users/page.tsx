import { MOCK_USERS } from '@/lib/mock-data/users'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, getInitials } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/constants'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export default function AdminUsersPage() {
  const staffUsers = MOCK_USERS.filter(u => u.role !== 'student')

  return (
    <div>
      <PageHeader
        title="Staff Users"
        subtitle="Admin and front desk account management"
        actions={
          <Link href="/admin/users/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <UserPlus className="w-4 h-4" /> Add User
          </Link>
        }
      />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Last Login</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {staffUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-amber-700 text-xs font-bold">{getInitials(user.name)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">{ROLE_LABELS[user.role] || user.role}</span>
                </td>
                <td className="px-5 py-3 text-slate-400 text-xs">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                <td className="px-5 py-3"><StatusBadge status={user.isActive ? 'active' : 'inactive'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
