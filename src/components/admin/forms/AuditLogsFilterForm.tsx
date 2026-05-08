'use client'

import { useState } from 'react'
import type { AuditActionOption } from '@/lib/api/audit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { CalendarRange, Search, X } from 'lucide-react'
import { AuditLogsFilters } from '@/hooks/useAuditLogs'

export interface AuditLogsFilterFormProps {
  actions: AuditActionOption[]
  initialFilters?: AuditLogsFilters
  onFilterChange: (filters: AuditLogsFilters) => void
  isLoading?: boolean
}

/**
 * Filter form for audit logs with staff email, activity, and date filtering.
 */
export function AuditLogsFilterForm({
  actions,
  initialFilters = {},
  onFilterChange,
  isLoading = false,
}: AuditLogsFilterFormProps) {
  const [filters, setFilters] = useState<AuditLogsFilters>(initialFilters)
  const [dateMode, setDateMode] = useState<'exact' | 'range'>(initialFilters.date ? 'exact' : 'range')

  const updateFilters = (next: AuditLogsFilters) => setFilters(next)

  const handleApply = () => {
    onFilterChange({
      actor_email: filters.actor_email?.trim() || undefined,
      action: filters.action || undefined,
      entity_type: filters.entity_type?.trim() || undefined,
      date: dateMode === 'exact' ? filters.date || undefined : undefined,
      date_from: dateMode === 'range' ? filters.date_from || undefined : undefined,
      date_to: dateMode === 'range' ? filters.date_to || undefined : undefined,
    })
  }

  const handleClearFilters = () => {
    const cleared: AuditLogsFilters = {}
    setFilters(cleared)
    setDateMode('range')
    onFilterChange(cleared)
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="staff-email">Staff Email</Label>
            <Input
              id="staff-email"
              value={filters.actor_email || ''}
              placeholder="staff@iiti.lk"
              onChange={(event) => updateFilters({ ...filters, actor_email: event.target.value || undefined })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-type">Activity</Label>
            <Select
              value={filters.action || 'all'}
              onValueChange={(value) => {
                const nextAction = value && value !== 'all' ? value : undefined
                updateFilters({
                  ...filters,
                  action: nextAction,
                })
              }}
              disabled={isLoading}
            >
              <SelectTrigger id="activity-type">
                <SelectValue placeholder="All activities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activities</SelectItem>
                {actions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 xl:col-span-2">
            <Label>Date Filter</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={dateMode === 'exact' ? 'default' : 'outline'}
                onClick={() => {
                  updateFilters({ ...filters, date_from: undefined, date_to: undefined })
                  setDateMode('exact')
                }}
                disabled={isLoading}
              >
                Exact Date
              </Button>
              <Button
                type="button"
                variant={dateMode === 'range' ? 'default' : 'outline'}
                onClick={() => {
                  updateFilters({ ...filters, date: undefined })
                  setDateMode('range')
                }}
                disabled={isLoading}
              >
                Date Range
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 lg:self-end">
          <Button type="button" onClick={handleApply} disabled={isLoading} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button type="button" variant="ghost" onClick={handleClearFilters} disabled={isLoading} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dateMode === 'exact' ? (
          <div className="space-y-2">
            <Label htmlFor="audit-date">Exact Date</Label>
            <Input
              id="audit-date"
              type="date"
              value={filters.date || ''}
              onChange={(event) => updateFilters({ ...filters, date: event.target.value || undefined })}
              disabled={isLoading}
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.date_from || ''}
                onChange={(event) => updateFilters({ ...filters, date_from: event.target.value || undefined })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.date_to || ''}
                onChange={(event) => updateFilters({ ...filters, date_to: event.target.value || undefined })}
                disabled={isLoading}
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="entity-type">Project Area</Label>
          <Input
            id="entity-type"
            value={filters.entity_type || ''}
            placeholder="students, enrollments, payments"
            onChange={(event) => updateFilters({ ...filters, entity_type: event.target.value || undefined })}
            disabled={isLoading}
          />
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
            <CalendarRange className="h-4 w-4" />
            Quick Tip
          </div>
          Search by a known staff email, then narrow by activity and either one date or a date range.
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 text-sm text-muted-foreground">
          Active filters: {Object.values(filters).filter(Boolean).length}
        </div>
      )}
    </Card>
  )
}
