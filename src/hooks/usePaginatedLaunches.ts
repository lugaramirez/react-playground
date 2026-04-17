import { useEffect, useState } from 'react'
import { fetchLaunches } from '../api/launches'
import { SORT_FIELD_MAP } from '../utils/sortFieldMap'
import type { Launch, SortField, SortDirection } from '../types/launch'

interface UsePaginatedLaunchesArgs {
  sort: SortField
  direction: SortDirection
  page: number
  pageSize: number
}

interface UsePaginatedLaunchesResult {
  launches: Launch[]
  fetching: boolean
  error: Error | undefined
  hasMore: boolean
}

// usePaginatedLaunches fetches one page at a time.
// Re-fetches automatically whenever sort/direction/page/pageSize change.
//
// We derive `hasMore` from the result count: if we received exactly `pageSize`
// items, there may be more. If we received fewer, we've reached the last page.
// This avoids a separate total-count query.
export function usePaginatedLaunches({
  sort,
  direction,
  page,
  pageSize,
}: UsePaginatedLaunchesArgs): UsePaginatedLaunchesResult {
  const [launches, setLaunches] = useState<Launch[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<Error | undefined>()

  // Convert 1-based page number to 0-based offset for the API.
  const offset = (page - 1) * pageSize

  useEffect(() => {
    const controller = new AbortController()
    setFetching(true)
    setError(undefined)

    fetchLaunches(pageSize, offset, SORT_FIELD_MAP[sort], direction)
      .then(data => {
        if (controller.signal.aborted) return
        setLaunches(data)
        setFetching(false)
      })
      .catch(err => {
        if (controller.signal.aborted) return
        setError(err as Error)
        setFetching(false)
      })

    return () => controller.abort()
  }, [sort, direction, pageSize, offset])

  return {
    launches,
    fetching,
    error,
    hasMore: launches.length === pageSize,
  }
}
