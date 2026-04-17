import { mockLaunches } from './mockLaunches'
import type { Launch } from '../types/launch'

interface QueryVariables {
  limit?: number
  offset?: number
  sort?: string
  order?: string
}

// Pure function — contains all the sort+slice logic so it can be unit tested
// without dealing with any network layer.
export function queryMockData({
  limit = 20,
  offset = 0,
  sort = 'date_local',
  order = 'desc',
}: QueryVariables): Launch[] {
  const sorted = [...mockLaunches].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    if (sort === 'name') {
      aVal = a.mission_name
      bVal = b.mission_name
    } else if (sort === 'success') {
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
