import { createClient, Provider, cacheExchange, fetchExchange } from 'urql'
import { LaunchesPage } from './pages/LaunchesPage/LaunchesPage'

// `createClient` creates a urql client bound to a specific GraphQL endpoint.
// This is the single place where the API URL lives — if the endpoint changes,
// you only update it here.
//
// The SpaceX community API at spacex.land is free and requires no auth token.
// urql v5 requires exchanges to be passed explicitly — they are no longer
// included by default. cacheExchange deduplicates identical in-flight requests;
// fetchExchange performs the actual HTTP call.
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
