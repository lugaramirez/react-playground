import { renderHook, act } from '@testing-library/react'
import { useQuery } from 'urql'
import { useInfiniteLaunches } from './useInfiniteLaunches'
import { mockLaunch, fullBatch } from '../test/mocks'

vi.mock('urql', () => ({ useQuery: vi.fn(), gql: String.raw }))

const mockSuccess = (launches: typeof mockLaunch[]) =>
  vi.mocked(useQuery).mockReturnValue([
    { data: { launchesPast: launches }, fetching: false, error: undefined },
    vi.fn(),
  ] as any)

describe('useInfiniteLaunches', () => {
  beforeEach(() => mockSuccess([mockLaunch]))

  it('returns the initial batch of launches', () => {
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    expect(result.current.launches).toHaveLength(1)
    expect(result.current.launches[0].id).toBe('1')
  })

  it('returns fetching state from urql', () => {
    vi.mocked(useQuery).mockReturnValue([
      { data: undefined, fetching: true, error: undefined },
      vi.fn(),
    ] as any)
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    expect(result.current.fetching).toBe(true)
  })

  it('passes correct initial variables (offset 0, limit 20)', () => {
    renderHook(() => useInfiniteLaunches('name', 'asc'))
    expect(vi.mocked(useQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          limit: 20,
          offset: 0,
          sort: 'mission_name',
          order: 'asc',
        }),
      })
    )
  })

  it('returns hasMore true when the batch is exactly 20 items', () => {
    mockSuccess(fullBatch)
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    expect(result.current.hasMore).toBe(true)
  })

  it('returns hasMore false when the batch has fewer than 20 items', () => {
    mockSuccess([mockLaunch])
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    expect(result.current.hasMore).toBe(false)
  })

  it('exposes a fetchMore function', () => {
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    expect(typeof result.current.fetchMore).toBe('function')
  })

  it('advances the offset by 20 when fetchMore is called', () => {
    mockSuccess(fullBatch)
    const { result } = renderHook(() => useInfiniteLaunches('date', 'desc'))
    act(() => result.current.fetchMore())
    expect(vi.mocked(useQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ offset: 20 }),
      })
    )
  })
})
