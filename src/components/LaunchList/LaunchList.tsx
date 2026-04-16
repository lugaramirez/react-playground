import { LaunchCard } from '../LaunchCard/LaunchCard'
import type { Launch } from '../../types/launch'

interface LaunchListProps {
  launches: Launch[]
  fetching: boolean
  error: Error | undefined
}

// LaunchList is responsible only for rendering states: loading, error, empty, or a list.
// It receives data as props — no fetching happens here. This separation makes it easy
// to test each state in isolation and to reuse the list with any data source.
export function LaunchList({ launches, fetching, error }: LaunchListProps) {
  // Show spinner only on the initial load (no existing data).
  // During infinite scroll top-ups, we already have data to show, so we don't
  // replace the list with a spinner — that would be jarring for the user.
  if (fetching && launches.length === 0) {
    return (
      <div className="flex justify-center py-12" role="status" aria-label="Loading launches">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm py-8 text-center" role="alert">
        Failed to load launches: {error.message}
      </div>
    )
  }

  if (launches.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-8 text-center">No launches found.</p>
    )
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Launch list">
      {launches.map(launch => (
        <li key={launch.id}>
          <LaunchCard launch={launch} />
        </li>
      ))}
    </ul>
  )
}
