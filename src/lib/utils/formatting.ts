/**
 * Date/time formatting utilities
 */

/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export function formatDateToIso(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format date and time with timezone
 */
export function formatDateTimeWithTz(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
}

/**
 * Format date display (e.g., "Jan 15, 2025")
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

/**
 * Format time only (e.g., "02:30 PM")
 */
export function formatTimeOnly(date: Date): string {
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return formatDateDisplay(date)
}

/**
 * Format date range (e.g., "Jan 1 - Jan 31, 2025")
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDateDisplay(startDate)
  const end = formatDateDisplay(endDate)

  if (startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()} - ${end}`
  }

  return `${start} - ${end}`
}
