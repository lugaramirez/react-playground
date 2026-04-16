import type { SortField, SortDirection, PageSize } from '../../types/launch'

interface ToolbarProps {
  sort: SortField
  direction: SortDirection
  pageSize: PageSize
  onSortChange: (field: SortField, direction: SortDirection) => void
  onPageSizeChange: (size: PageSize) => void
}

// Declared outside the component so they're not recreated on every render.
const SORT_BUTTONS: { field: SortField; label: string }[] = [
  { field: 'date', label: 'Date' },
  { field: 'name', label: 'Name' },
  { field: 'status', label: 'Status' },
]

const PAGE_SIZES: { value: PageSize; label: string }[] = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 'infinite', label: '∞' },
]

// Toolbar is a controlled component — it receives the current sort/pageSize state
// as props and calls callbacks to request changes. The parent (LaunchesPage) owns
// the actual state.
export function Toolbar({ sort, direction, pageSize, onSortChange, onPageSizeChange }: ToolbarProps) {
  function handleSortClick(field: SortField) {
    if (field === sort) {
      // Same field clicked again — flip the direction.
      onSortChange(field, direction === 'asc' ? 'desc' : 'asc')
    } else {
      // New field — always start descending.
      onSortChange(field, 'desc')
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
      <span className="text-slate-500 text-xs font-bold tracking-widest">SORT</span>

      <div className="flex bg-slate-900 rounded-md overflow-hidden border border-slate-700">
        {SORT_BUTTONS.map(({ field, label }) => {
          const isActive = sort === field
          const arrow = isActive ? (direction === 'desc' ? ' ↓' : ' ↑') : ''
          return (
            <button
              key={field}
              onClick={() => handleSortClick(field)}
              aria-pressed={isActive}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-slate-700 last:border-r-0 ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {label}{arrow}
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      <span className="text-slate-500 text-xs font-bold tracking-widest">PAGE SIZE</span>

      <div className="flex bg-slate-900 rounded-md overflow-hidden border border-slate-700">
        {PAGE_SIZES.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => onPageSizeChange(value)}
            aria-pressed={pageSize === value}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-slate-700 last:border-r-0 ${
              pageSize === value
                ? 'bg-blue-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
