import { useEffect, useRef, useState } from 'react'
import { useQuery } from 'urql'
import { LAUNCHES_QUERY } from '../queries/launches'
import { SORT_FIELD_MAP } from '../utils/sortFieldMap'
import type { Launch, SortField, SortDirection } from '../types/launch'

// How many launches to load per scroll — fixed at 20 as per the design spec.
const BATCH_SIZE = 20

interface UseInfiniteLaunchesResult {
  launches: Launch[]
  fetching: boolean
  error: Error | undefined
  fetchMore: () => void
  hasMore: boolean
}

// useInfiniteLaunches accumulates launch batches across multiple fetches.
// This is the key difference from usePaginatedLaunches: instead of replacing
// results when the page changes, we append new batches to existing ones.
//
// When sort or direction changes, we reset both the offset and the accumulator
// so the list starts fresh with the new ordering.
export function useInfiniteLaunches(
  sort: SortField,
  direction: SortDirection,
): UseInfiniteLaunchesResult {
  const [offset, setOffset] = useState(0)
  const [accumulated, setAccumulated] = useState<Launch[]>([])

  // useQuery runs the GraphQL query and re-runs whenever its variables change.
  // `requestPolicy: 'network-only'` bypasses urql's cache so each fetchMore
  // always hits the network — important for consistent pagination behavior.
  const [{ data, fetching, error }] = useQuery<{ launchesPast: Launch[] }>({
    query: LAUNCHES_QUERY,
    variables: {
      limit: BATCH_SIZE,
      offset,
      sort: SORT_FIELD_MAP[sort],
      order: direction,
    },
    requestPolicy: 'network-only',
  })

  // Tracks the last-committed sort/direction to distinguish "values actually changed"
  // from "effect ran on mount" (which is the same thing in React's eyes).
  const prevSortRef = useRef(sort)
  const prevDirectionRef = useRef(direction)

  // Tracks which page offsets have already been appended in the current sort session.
  // This is the deduplication key: offsets are business-stable, array references are not.
  //
  // Why not compare data references? React Strict Mode tears down and re-establishes
  // urql's subscription on Phase 2, which re-runs the exchange and returns a brand-new
  // array reference — even for the same offset and same data values.
  const fetchedOffsetsRef = useRef(new Set<number>())

  // When sort or direction changes, reset to the beginning.
  useEffect(() => {
    if (prevSortRef.current === sort && prevDirectionRef.current === direction) return
    prevSortRef.current = sort
    prevDirectionRef.current = direction
    fetchedOffsetsRef.current = new Set()
    setOffset(0)
    setAccumulated([])
  }, [sort, direction])

  // Ref tracks the offset at the time data was received, allowing us to
  // distinguish a fresh load (offset 0) from a subsequent page (offset > 0)
  // without adding `offset` to the effect's dependency array (which would
  // cause double-appending as offset and data update in separate render cycles).
  const offsetAtFetch = useRef(offset)
  offsetAtFetch.current = offset

  useEffect(() => {
    if (!data?.launchesPast) return
    const currentOffset = offsetAtFetch.current
    if (fetchedOffsetsRef.current.has(currentOffset)) return
    fetchedOffsetsRef.current.add(currentOffset)
    const isFirstPage = currentOffset === 0
    setAccumulated(prev =>
      isFirstPage ? [...data.launchesPast] : [...prev, ...data.launchesPast]
    )
    // Intentionally omits `offset` from deps — see offsetAtFetch comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.launchesPast])

  return {
    launches: accumulated,
    fetching,
    error: error as Error | undefined,
    fetchMore: () => setOffset(o => o + BATCH_SIZE),
    hasMore: (data?.launchesPast?.length ?? 0) === BATCH_SIZE,
  }
}
