import type { SortField } from '../types/launch'

// Maps our UI sort keys to the field names the SpaceX REST API v4 expects.
// Extracted to a shared utility so both hooks stay DRY — neither has to
// redefine this mapping independently.
export const SORT_FIELD_MAP: Record<SortField, string> = {
  date: 'date_local',
  name: 'name',
  status: 'success',
}
