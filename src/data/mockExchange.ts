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
      const { limit = 20, offset = 0 } = (operation.variables ?? {}) as {
        limit?: number
        offset?: number
      }
      const slice = mockLaunches.slice(offset, offset + limit)
      return makeResult(operation, { data: { launchesPast: slice } })
    })
  )
