import type { SortField } from '../types/launch'

// Maps our UI sort keys to the field names the SpaceX GraphQL API expects.
// Extracted to a shared utility so both hooks stay DRY — neither has to
// redefine this mapping independently.
export const SORT_FIELD_MAP: Record<SortField, string> = {
  date: 'launch_date_local',
  name: 'mission_name',
  status: 'launch_success',
}
