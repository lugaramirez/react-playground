import { queryMockData } from '../data/mockExchange'
import type { Launch } from '../types/launch'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_URL = 'https://api.spacexdata.com/v4/launches/query'

function transformLaunch(raw: Record<string, unknown>): Launch {
  const links = raw.links as Record<string, unknown> | null
  const patch = links?.patch as Record<string, string | null> | null
  const rocket = raw.rocket as Record<string, string> | null
  return {
    id: raw.id as string,
    mission_name: raw.name as string,
    launch_date_local: raw.date_local as string,
    launch_success: raw.success as boolean | null,
    rocket: rocket ? { rocket_name: rocket.name } : null,
    links: patch?.small ? { mission_patch_small: patch.small } : null,
  }
}

// Fetches a page of past launches from the SpaceX REST API v4, or returns
// mock data when VITE_USE_MOCK=true. Keeps transport detail out of the hooks.
export async function fetchLaunches(
  limit: number,
  offset: number,
  sort: string,
  order: string,
): Promise<Launch[]> {
  if (USE_MOCK) {
    return Promise.resolve(queryMockData({ limit, offset, sort, order }))
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: {},
      options: {
        limit,
        offset,
        sort: { [sort]: order },
        populate: ['rocket'],
      },
    }),
  })

  if (!response.ok) throw new Error(`SpaceX API error: ${response.status}`)
  const data = await response.json() as { docs: Record<string, unknown>[] }
  return data.docs.map(transformLaunch)
}
