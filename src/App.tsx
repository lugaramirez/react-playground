import { createClient, Provider, cacheExchange, fetchExchange } from 'urql'
import { LaunchesPage } from './pages/LaunchesPage/LaunchesPage'
import { mockExchange } from './data/mockExchange'

// Controlled by the VITE_USE_MOCK env variable — set via npm run dev:mock.
// Vite exposes variables prefixed with VITE_ to client code via import.meta.env.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

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
