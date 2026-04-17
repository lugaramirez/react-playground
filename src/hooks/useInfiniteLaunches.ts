import { useEffect, useRef, useState } from 'react'
import { fetchLaunches } from '../api/launches'
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
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<Error | undefined>()
  const [hasMore, setHasMore] = useState(false)

  // Tracks the last-committed sort/direction to distinguish "values actually changed"
  // from "effect ran on mount" (which is the same thing in React's eyes).
  const prevSortRef = useRef(sort)
  const prevDirectionRef = useRef(direction)

  // When sort or direction changes, reset to the beginning.
  useEffect(() => {
    if (prevSortRef.current === sort && prevDirectionRef.current === direction) return
    prevSortRef.current = sort
    prevDirectionRef.current = direction
    setOffset(0)
    setAccumulated([])
  }, [sort, direction])

  // Fetch whenever sort, direction, or offset changes.
  // AbortController handles React Strict Mode's double-invoke: the first
  // controller is aborted on cleanup, the second fetch lands and commits data.
  useEffect(() => {
    const controller = new AbortController()
    setFetching(true)
    setError(undefined)

    fetchLaunches(BATCH_SIZE, offset, SORT_FIELD_MAP[sort], direction)
      .then(data => {
        if (controller.signal.aborted) return
        setAccumulated(prev => offset === 0 ? data : [...prev, ...data])
        setHasMore(data.length === BATCH_SIZE)
        setFetching(false)
      })
      .catch(err => {
        if (controller.signal.aborted) return
        setError(err as Error)
        setFetching(false)
      })

    return () => controller.abort()
  }, [sort, direction, offset])

  return {
    launches: accumulated,
    fetching,
    error,
    fetchMore: () => setOffset(o => o + BATCH_SIZE),
    hasMore,
  }
}
