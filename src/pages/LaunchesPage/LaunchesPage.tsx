import { useState } from 'react'
import { Toolbar } from '../../components/Toolbar/Toolbar'
import { LaunchList } from '../../components/LaunchList/LaunchList'
import { Pagination } from '../../components/Pagination/Pagination'
import { InfiniteScrollTrigger } from '../../components/InfiniteScrollTrigger/InfiniteScrollTrigger'
import { usePaginatedLaunches } from '../../hooks/usePaginatedLaunches'
import { useInfiniteLaunches } from '../../hooks/useInfiniteLaunches'
import type { SortField, SortDirection, PageSize } from '../../types/launch'

// React's rules of hooks require that hooks are always called in the same order
// and are never called conditionally. We can't write `if (mode) useInfinite()`.
// The solution: extract each mode into its own sub-component. When LaunchesPage
// conditionally renders <PaginatedView> or <InfiniteView>, React manages the
// hook call correctly inside each sub-component's own render cycle.

function PaginatedView({
  sort, direction, page, pageSize, onPageChange,
}: {
  sort: SortField
  direction: SortDirection
  page: number
  pageSize: number
  onPageChange: (p: number) => void
}) {
  const { launches, fetching, error, hasMore } = usePaginatedLaunches({
    sort, direction, page, pageSize,
  })
  return (
    <>
      <LaunchList launches={launches} fetching={fetching} error={error} />
      <Pagination page={page} hasMore={hasMore} onPageChange={onPageChange} />
    </>
  )
}

function InfiniteView({ sort, direction }: { sort: SortField; direction: SortDirection }) {
  const { launches, fetching, error, fetchMore, hasMore } = useInfiniteLaunches(sort, direction)
  return (
    <>
      <LaunchList launches={launches} fetching={fetching} error={error} />
      <InfiniteScrollTrigger onTrigger={fetchMore} hasMore={hasMore} fetching={fetching} />
    </>
  )
}

// LaunchesPage owns all UI state: sort field, direction, page size, and current page.
// It delegates rendering to PaginatedView or InfiniteView based on the chosen page size.
export function LaunchesPage() {
  const [sort, setSort] = useState<SortField>('date')
  const [direction, setDirection] = useState<SortDirection>('desc')
  const [pageSize, setPageSize] = useState<PageSize>(5)
  const [page, setPage] = useState(1)

  function handleSortChange(field: SortField, dir: SortDirection) {
    setSort(field)
    setDirection(dir)
    setPage(1)
  }

  function handlePageSizeChange(size: PageSize) {
    setPageSize(size)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold">🚀 SpaceX Launches</h1>
          <p className="text-slate-500 text-sm mt-1">Powered by the SpaceX GraphQL API</p>
        </div>

        <Toolbar
          sort={sort}
          direction={direction}
          pageSize={pageSize}
          onSortChange={handleSortChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {pageSize === 'infinite' ? (
          <InfiniteView sort={sort} direction={direction} />
        ) : (
          <PaginatedView
            sort={sort}
            direction={direction}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
