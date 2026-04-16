import { createClient, Provider, cacheExchange, fetchExchange } from 'urql'
import { LaunchesPage } from './pages/LaunchesPage/LaunchesPage'
import { installMockFetch } from './data/mockFetch'

// Set to true when the real SpaceX GraphQL API is unavailable.
// Intercepts fetch calls and returns local mock data instead.
const USE_MOCK = true

if (USE_MOCK) {
  installMockFetch()
}

// urql v5 requires exchanges to be passed explicitly — they are no longer
// included by default. cacheExchange deduplicates identical in-flight requests;
// fetchExchange performs the actual HTTP call (or the mock, if USE_MOCK is set).
const client = createClient({
  url: 'https://api.spacex.land/graphql/',
  exchanges: [cacheExchange, fetchExchange],
})

// The urql `Provider` makes the client available to every `useQuery` call
// in the component tree below it — similar to React context.
export function App() {
  return (
    <Provider value={client}>
      <LaunchesPage />
    </Provider>
  )
}
