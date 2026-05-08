"use client"

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { RestrictedAccess } from '@/components/shared/RestrictedAccess'
import { AuditLogsFilterForm } from '@/components/admin/forms/AuditLogsFilterForm'
import { AuditLogsTable } from '@/components/admin/tables/AuditLogsTable'
import { Pagination } from '@/components/shared/Pagination'
import { useAuditLogs, AuditLogsFilters } from '@/hooks/useAuditLogs'
import { apiGetAuditActions, type AuditActionOption } from '@/lib/api/audit'
import { ApiError } from '@/lib/api/core'
import { Shield } from 'lucide-react'

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1)
  const [perPage] = useState(50)
  const [filters, setFilters] = useState<AuditLogsFilters>({})
  const [actions, setActions] = useState<AuditActionOption[]>([])

  const { data, isLoading, error, isForbidden, refetch } = useAuditLogs(page, perPage, filters)

  useEffect(() => {
    let ignore = false

    const loadActions = async () => {
      try {
        const response = await apiGetAuditActions()
        if (!ignore) {
          setActions(response)
        }
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 403) && !ignore) {
          setActions([])
        }
      }
    }

    loadActions()
    return () => {
      ignore = true
    }
  }, [])

  const handleFilterChange = (newFilters: AuditLogsFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Search staff activity by email, activity type, and date or date range."
      />

      {isForbidden ? (
        <RestrictedAccess
          title="Audit Logs Access Restricted"
          message="Your role no longer has the audit.view permission."
          backHref="/admin/dashboard"
          backLabel="Back to Dashboard"
        />
      ) : (
        <>
          <AuditLogsFilterForm
            actions={actions}
            initialFilters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />

          {data && (
            <div className="rounded-md border p-4 bg-muted/30">
              <div className="flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>
                  Showing <span className="font-semibold text-foreground">{data.items.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{data.total}</span> recorded staff activities
                </p>
                <p>Each row includes the exact date and time the activity happened.</p>
              </div>
            </div>
          )}

          <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
            {data && data.items.length > 0 ? (
              <>
                <AuditLogsTable logs={data.items} isLoading={isLoading} />

                {data.pages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={data.pages}
                    onPageChange={setPage}
                    disabled={isLoading}
                  />
                )}
              </>
            ) : (
              <EmptyState
                icon={Shield}
                title="No audit logs found"
                description={Object.values(filters).some(Boolean)
                  ? "No staff activities matched the selected email, activity, or date filters."
                  : "No staff activities have been recorded yet. Once staff log in or perform updates, they will appear here."}
              />
            )}
          </DataLoader>
        </>
      )}
    </div>
  )
}
