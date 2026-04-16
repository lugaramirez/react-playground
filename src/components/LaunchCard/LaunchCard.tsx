import type { Launch } from '../../types/launch'

interface LaunchCardProps {
  launch: Launch
}

// Formats an ISO date string to a locale-aware short date.
// Intl.DateTimeFormat is built into the browser — no date library needed.
function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate))
}

// Returns Tailwind classes for the status badge based on launch outcome.
function statusClasses(success: boolean | null): string {
  if (success === true) return 'bg-emerald-900 text-emerald-300'
  if (success === false) return 'bg-red-900 text-red-300'
  return 'bg-slate-700 text-slate-400'
}

function statusLabel(success: boolean | null): string {
  if (success === true) return 'Success'
  if (success === false) return 'Failed'
  return 'Unknown'
}

// LaunchCard is a pure display component — it receives a launch object and
// renders it. No data fetching, no state.
export function LaunchCard({ launch }: LaunchCardProps) {
  const { mission_name, launch_date_local, launch_success, rocket, links } = launch

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center gap-4">
      {/* Mission patch or rocket emoji fallback */}
      <div className="w-11 h-11 bg-slate-900 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
        {links?.mission_patch_small ? (
          <img
            src={links.mission_patch_small}
            alt={`${mission_name} patch`}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-2xl" aria-hidden="true">🚀</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-slate-100 font-semibold text-sm truncate">{mission_name}</p>
        <p className="text-slate-400 text-xs mt-0.5">
          {rocket?.rocket_name} · {formatDate(launch_date_local)}
        </p>
      </div>

      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusClasses(launch_success)}`}>
        {statusLabel(launch_success)}
      </span>
    </div>
  )
}
