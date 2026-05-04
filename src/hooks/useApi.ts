import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiError } from '@/lib/api/core'

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const depsRef = useRef<unknown[]>()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error && err.message) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    // Only refetch if deps have actually changed, not on every render
    const depsChanged = !depsRef.current || 
      deps.length !== depsRef.current.length ||
      deps.some((dep, i) => dep !== depsRef.current![i])
    
    if (depsChanged) {
      depsRef.current = deps
      fetchData()
    }
  }, [deps, fetchData]) // Only refetch if deps actually change

  return { data, isLoading, error, refetch: fetchData }
}
