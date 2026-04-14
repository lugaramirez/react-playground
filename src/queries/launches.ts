import { gql } from 'urql'

// `gql` is a tagged template literal that parses the query string into a
// DocumentNode — the format GraphQL clients expect. urql re-exports it from
// the graphql package so you don't need a separate graphql-tag dependency.
//
// This query targets the SpaceX community GraphQL API at:
// https://api.spacex.land/graphql/
//
// `launchesPast` returns completed launches sorted and paginated server-side.
// We request only the fields we render — keeping the payload small is good
// GraphQL practice (avoid over-fetching).
export const LAUNCHES_QUERY = gql`
  query GetLaunches(
    $limit: Int
    $offset: Int
    $sort: String
    $order: String
  ) {
    launchesPast(limit: $limit, offset: $offset, sort: $sort, order: $order) {
      id
      mission_name
      launch_date_local
      launch_success
      rocket {
        rocket_name
      }
      links {
        mission_patch_small
      }
    }
  }
`
