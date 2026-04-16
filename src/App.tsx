import { createClient, Provider, cacheExchange, fetchExchange } from 'urql'
import { LaunchesPage } from './pages/LaunchesPage/LaunchesPage'
import { mockExchange } from './data/mockExchange'

// Set to true when the real SpaceX GraphQL API is unavailable.
// Swaps in a local exchange that returns mock data — no network call made.
// Set to false and restore a real API URL to use live data.
const USE_MOCK = true

// urql v5 requires exchanges to be passed explicitly.
// In mock mode we skip fetchExchange entirely — mockExchange intercepts every
// operation and returns data directly, so nothing ever hits the network.
const client = createClient({
  url: 'https://api.spacex.land/graphql/',
  exchanges: USE_MOCK ? [mockExchange] : [cacheExchange, fetchExchange],
})

export function App() {
  return (
    <Provider value={client}>
      <LaunchesPage />
    </Provider>
  )
}
