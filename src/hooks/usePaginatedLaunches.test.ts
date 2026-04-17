import { renderHook, waitFor, act } from '@testing-library/react'
import { fetchLaunches } from '../api/launches'
import { usePaginatedLaunches } from './usePaginatedLaunches'
import { mockLaunch, fullBatch } from '../test/mocks'

vi.mock('../api/launches', () => ({ fetchLaunches: vi.fn() }))

const mockSuccess = (launches: typeof mockLaunch[]) =>
  vi.mocked(fetchLaunches).mockResolvedValue(launches)

describe('usePaginatedLaunches', () => {
  beforeEach(() => mockSuccess([mockLaunch]))

  it('returns launches from the query result', async () => {
    const { result } = renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 1, pageSize: 5 })
    )
    await waitFor(() => expect(result.current.fetching).toBe(false))
    expect(result.current.launches).toHaveLength(1)
    expect(result.current.launches[0].mission_name).toBe('Starlink 6-14')
  })

  it('returns an empty array while fetching', async () => {
    let resolve!: (v: Awaited<ReturnType<typeof fetchLaunches>>) => void
    vi.mocked(fetchLaunches).mockReturnValue(new Promise(r => { resolve = r }))
    const { result } = renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 1, pageSize: 5 })
    )
    expect(result.current.launches).toEqual([])
    expect(result.current.fetching).toBe(true)
    await act(async () => resolve([]))
  })

  it('calculates offset as (page - 1) * pageSize', () => {
    renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 3, pageSize: 10 })
    )
    expect(vi.mocked(fetchLaunches)).toHaveBeenCalledWith(10, 20, 'date_local', 'desc')
  })

  it('maps sort field "date" to "date_local"', () => {
    renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'asc', page: 1, pageSize: 5 })
    )
    expect(vi.mocked(fetchLaunches)).toHaveBeenCalledWith(5, 0, 'date_local', 'asc')
  })

  it('maps sort field "name" to "name"', () => {
    renderHook(() =>
      usePaginatedLaunches({ sort: 'name', direction: 'asc', page: 1, pageSize: 5 })
    )
    expect(vi.mocked(fetchLaunches)).toHaveBeenCalledWith(5, 0, 'name', 'asc')
  })

  it('maps sort field "status" to "success"', () => {
    renderHook(() =>
      usePaginatedLaunches({ sort: 'status', direction: 'desc', page: 1, pageSize: 5 })
    )
    expect(vi.mocked(fetchLaunches)).toHaveBeenCalledWith(5, 0, 'success', 'desc')
  })

  it('returns hasMore true when result count equals pageSize', async () => {
    mockSuccess(fullBatch)
    const { result } = renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 1, pageSize: 20 })
    )
    await waitFor(() => expect(result.current.fetching).toBe(false))
    expect(result.current.hasMore).toBe(true)
  })

  it('returns hasMore false when result count is less than pageSize', async () => {
    const { result } = renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 1, pageSize: 5 })
    )
    await waitFor(() => expect(result.current.fetching).toBe(false))
    expect(result.current.hasMore).toBe(false)
  })
})
