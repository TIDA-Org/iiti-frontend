import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

/**
 * Pagination component for navigating through paginated data.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const getVisiblePages = (): Array<number | '...'> => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: Array<number | '...'> = []
    let lastPage: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((pageNumber) => {
      if (lastPage !== undefined) {
        if (pageNumber - lastPage === 2) {
          rangeWithDots.push(lastPage + 1)
        } else if (pageNumber - lastPage !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(pageNumber)
      lastPage = pageNumber
    })

    return rangeWithDots
  }

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious || disabled}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
                …
              </span>
            )
          }

          return (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              disabled={disabled}
              className="min-w-10 h-10"
            >
              {page}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext || disabled}
        className="gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="text-sm text-muted-foreground">
        Page <span className="font-semibold">{currentPage}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>
    </div>
  )
}
