import { useQuery } from 'urql'
import { LAUNCHES_QUERY } from '../queries/launches'
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
// urql's useQuery re-executes automatically whenever its variables change,
// so changing sort/direction/page/pageSize in the parent will trigger a new request.
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
  // Convert 1-based page number to 0-based offset for the API.
  const offset = (page - 1) * pageSize

  const [{ data, fetching, error }] = useQuery<{ launchesPast: Launch[] }>({
    query: LAUNCHES_QUERY,
    variables: {
      limit: pageSize,
      offset,
      sort: SORT_FIELD_MAP[sort],
      order: direction,
    },
  })

  const launches = data?.launchesPast ?? []

  return {
    launches,
    fetching,
    error: error as Error | undefined,
    hasMore: launches.length === pageSize,
  }
}
