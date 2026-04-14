import type { Launch } from '../types/launch'

// Reusable mock objects keep tests DRY and ensure all tests work against
// the same data shape. Always mirror the real Launch interface exactly —
// if the interface changes, TypeScript will flag stale mocks immediately.

export const mockLaunch: Launch = {
  id: '1',
  mission_name: 'Starlink 6-14',
  launch_date_local: '2023-07-24T15:45:00-04:00',
  launch_success: true,
  rocket: { rocket_name: 'Falcon 9' },
  links: { mission_patch_small: null },
}

export const mockFailedLaunch: Launch = {
  id: '2',
  mission_name: 'Demo Mission 1',
  launch_date_local: '2006-03-24T22:30:00Z',
  launch_success: false,
  rocket: { rocket_name: 'Falcon 1' },
  links: { mission_patch_small: null },
}

// A full batch of 20 identical launches — used to test `hasMore: true`
// (when the API returns exactly BATCH_SIZE items, there may be more).
export const fullBatch: Launch[] = Array.from({ length: 20 }, (_, i) => ({
  ...mockLaunch,
  id: String(i + 1),
}))
