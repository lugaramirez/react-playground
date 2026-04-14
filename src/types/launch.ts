// The shape returned by the SpaceX GraphQL API for each launch.
// Fields are nullable (| null) because the API doesn't guarantee every field
// is present for every launch — older launches may be missing data.
export interface Launch {
  id: string
  mission_name: string
  launch_date_local: string       // ISO 8601 date string
  launch_success: boolean | null  // null = unknown (pre-outcome data)
  rocket: { rocket_name: string } | null
  links: { mission_patch_small: string | null } | null
}

// SortField represents the three axes we expose in the Toolbar.
export type SortField = 'date' | 'name' | 'status'

// SortDirection controls the order returned by the API.
export type SortDirection = 'asc' | 'desc'

// PageSize is a union of concrete numbers plus 'infinite' for the scroll mode.
// Using a union (not just `number`) lets TypeScript enforce that only valid
// page sizes can be passed to components.
export type PageSize = 5 | 10 | 20 | 'infinite'
