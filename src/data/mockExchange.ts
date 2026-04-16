import { makeResult, type Exchange } from 'urql'
import { pipe, map } from 'wonka'
import { mockLaunches } from './mockLaunches'
import type { Launch } from '../types/launch'

interface QueryVariables {
  limit?: number
  offset?: number
  sort?: string
  order?: string
}

// Pure function — contains all the sort+slice logic so it can be unit tested
// without dealing with urql clients or wonka streams.
// The exchange below is just a thin adapter that calls this function.
export function queryMockData({
  limit = 20,
  offset = 0,
  sort = 'launch_date_local',
  order = 'desc',
}: QueryVariables): Launch[] {
  const sorted = [...mockLaunches].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    if (sort === 'mission_name') {
      aVal = a.mission_name
      bVal = b.mission_name
    } else if (sort === 'launch_success') {
      // true → 2, null → 1, false → 0  (arbitrary but stable ordering)
      aVal = a.launch_success === true ? 2 : a.launch_success === null ? 1 : 0
      bVal = b.launch_success === true ? 2 : b.launch_success === null ? 1 : 0
    } else {
      aVal = new Date(a.launch_date_local).getTime()
      bVal = new Date(b.launch_date_local).getTime()
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })

  return sorted.slice(offset, offset + limit)
}

// A custom urql exchange that intercepts every operation and returns a slice
// of mockLaunches based on the limit/offset/sort/order variables.
// No network call is ever made.
export const mockExchange: Exchange = () => ops$ =>
  pipe(
    ops$,
    map(operation =>
      makeResult(operation, {
        data: { launchesPast: queryMockData(operation.variables ?? {}) },
      })
    )
  )
