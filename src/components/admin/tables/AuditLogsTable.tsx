'use client'

import { AuditLogApiResponse } from '@/lib/api/audit'
import { formatDateDisplay, formatTimeOnly } from '../../../lib/utils/formatting'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollText } from 'lucide-react'

export interface AuditLogsTableProps {
  logs: AuditLogApiResponse[]
  isLoading?: boolean
}

function toLabel(action: string) {
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * Audit logs table focused on simple activity review.
 */
export function AuditLogsTable({ logs, isLoading = false }: AuditLogsTableProps) {
  const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' => {
    if (action.includes('delete') || action.includes('revoke')) return 'destructive'
    if (action.includes('create') || action.includes('approve')) return 'default'
    return 'secondary'
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-32">Date</TableHead>
            <TableHead className="min-w-24">Time</TableHead>
            <TableHead className="min-w-48">Staff</TableHead>
            <TableHead className="min-w-44">Activity</TableHead>
            <TableHead className="min-w-32">Area</TableHead>
            <TableHead className="min-w-72">What Happened</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                {isLoading ? 'Loading audit logs...' : 'No audit logs found'}
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id} className="align-top">
                <TableCell className="font-medium">{formatDateDisplay(new Date(log.created_at))}</TableCell>
                <TableCell className="font-mono text-sm">{formatTimeOnly(new Date(log.created_at))}</TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{log.actor_name || 'Unknown Staff'}</div>
                  <div className="text-xs text-muted-foreground">{log.actor_email || 'No email recorded'}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action)}>{toLabel(log.action)}</Badge>
                  <div className="mt-1 text-xs text-muted-foreground">{log.actor_role || 'staff'}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.entity_type || 'system'}</TableCell>
                <TableCell>
                  <div className="flex items-start gap-2 text-sm">
                    <ScrollText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{log.description || 'Activity recorded successfully.'}</div>
                      {log.ip_address && (
                        <div className="mt-1 text-xs text-muted-foreground">IP: {log.ip_address}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
