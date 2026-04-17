import { renderHook, act, waitFor } from '@testing-library/react'
import { fetchLaunches } from '../api/launches'
import { useInfiniteLaunches } from './useInfiniteLaunches'
import { mockLaunch, fullBatch } from '../test/mocks'

vi.mock('../api/launches', () => ({ fetchLaunches: vi.fn() }))

const mockSuccess = (launches: typeof mockLaunch[]) =>
  vi.mocked(fetchLaunches).mockResolvedValue(launches)

describe('useInfiniteLaunches', () => {
  beforeEach(() => mockSuccess([mockLaunch]))

  it('returns the initial batch of launches', async () => {
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    await waitFor(() => expect(result.current.launches).toHaveLength(1))
    expect(result.current.launches[0].id).toBe('1')
  })

  it('returns fetching state', async () => {
    let resolve!: (v: Awaited<ReturnType<typeof fetchLaunches>>) => void
    vi.mocked(fetchLaunches).mockReturnValue(new Promise(r => { resolve = r }))
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    expect(result.current.fetching).toBe(true)
    await act(async () => resolve([]))
  })

  it('passes correct initial variables (offset 0, limit 20)', () => {
    renderHook(() => useInfiniteLaunches('name', 'asc'))
    expect(vi.mocked(fetchLaunches)).toHaveBeenCalledWith(20, 0, 'name', 'asc')
  })

  it('returns hasMore true when the batch is exactly 20 items', async () => {
    mockSuccess(fullBatch)
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    await waitFor(() => expect(result.current.hasMore).toBe(true))
  })

  it('returns hasMore false when the batch has fewer than 20 items', async () => {
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    await waitFor(() => expect(result.current.fetching).toBe(false))
    expect(result.current.hasMore).toBe(false)
  })

  it('exposes a fetchMore function', () => {
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    expect(typeof result.current.fetchMore).toBe('function')
  })

  it('advances the offset by 20 when fetchMore is called', async () => {
    mockSuccess(fullBatch)
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    await waitFor(() => expect(result.current.fetching).toBe(false))
    act(() => result.current.fetchMore())
    expect(vi.mocked(fetchLaunches)).toHaveBeenCalledWith(20, 20, 'date_local', 'desc')
  })
})
