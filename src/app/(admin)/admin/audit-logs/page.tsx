"use client"

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { RestrictedAccess } from '@/components/shared/RestrictedAccess'
import { apiGetAuditLogs } from '@/lib/api/audit'
import { ApiError } from '@/lib/api/core'
import { Shield } from 'lucide-react'

export default function AdminAuditLogsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    setForbidden(false)
    try {
      await apiGetAuditLogs(1, 20)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load audit logs')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="System activity trail (Super Admin only)" />

      {forbidden ? (
        <RestrictedAccess
          title="Audit Logs Access Restricted"
          message="Your role no longer has the audit.view permission."
          backHref="/admin/dashboard"
          backLabel="Back to Dashboard"
        />
      ) : (
        <DataLoader isLoading={isLoading} error={error} onRetry={load}>
          <EmptyState
            icon={Shield}
            title="No audit logs yet"
            description="Audit log tracking UI will be expanded in the next phase."
          />
        </DataLoader>
      )}
    </div>
  )
}
