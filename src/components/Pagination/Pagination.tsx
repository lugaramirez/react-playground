interface PaginationProps {
  page: number
  hasMore: boolean
  onPageChange: (page: number) => void
}

// Pagination uses `hasMore` (derived from result count) instead of a total count.
// This means we don't need an extra query just for the total. The tradeoff is that
// we can't show "Page 3 of 7" — but it keeps the data model simpler.
export function Pagination({ page, hasMore, onPageChange }: PaginationProps) {
  return (
    <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:text-slate-200 hover:enabled:bg-slate-700 transition-colors"
      >
        ← Prev
      </button>

      <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-blue-700 text-white min-w-[2rem] text-center">
        {page}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasMore}
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:text-slate-200 hover:enabled:bg-slate-700 transition-colors"
      >
        Next →
      </button>
    </nav>
  )
}
