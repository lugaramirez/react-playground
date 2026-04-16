import { mockLaunches } from './mockLaunches'

// Replaces window.fetch for dev/offline use.
// Parses the GraphQL request body, extracts limit/offset variables, and
// returns the appropriate slice of mockLaunches so pagination works correctly.
export function installMockFetch() {
  window.fetch = async (input, init) => {
    const body = JSON.parse((init?.body as string) ?? '{}')
    const { limit = 20, offset = 0 } = body.variables ?? {}

    const slice = mockLaunches.slice(offset, offset + limit)

    return new Response(
      JSON.stringify({ data: { launchesPast: slice } }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}
