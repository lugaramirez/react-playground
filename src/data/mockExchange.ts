import { makeResult, type Exchange } from 'urql'
import { pipe, map } from 'wonka'
import { mockLaunches } from './mockLaunches'

// A custom urql exchange that intercepts every operation and returns a slice
// of mockLaunches based on the limit/offset variables — no network call made.
//
// How urql exchanges work:
//   An exchange is a function: (ExchangeInput) => (ops$) => results$
//   ops$ is a stream of incoming GraphQL operations (queries/mutations).
//   The exchange maps each operation to a result and returns the result stream.
//   `makeResult` turns a plain data object into the OperationResult shape urql expects.
export const mockExchange: Exchange = () => ops$ =>
  pipe(
    ops$,
    map(operation => {
      const { limit = 20, offset = 0, sort = 'launch_date_local', order = 'desc' } =
        (operation.variables ?? {}) as {
          limit?: number
          offset?: number
          sort?: string
          order?: string
        }

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

      const slice = sorted.slice(offset, offset + limit)
      return makeResult(operation, { data: { launchesPast: slice } })
    })
  )
