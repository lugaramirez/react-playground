import { renderHook } from '@testing-library/react'
import { useQuery } from 'urql'
import { usePaginatedLaunches } from './usePaginatedLaunches'
import { mockLaunch, fullBatch } from '../test/mocks'

// We mock urql's useQuery so tests never make real network calls.
// Each test controls exactly what the hook "receives" from the API.
vi.mock('urql', () => ({ useQuery: vi.fn(), gql: String.raw }))

const mockSuccess = (launches: typeof mockLaunch[]) =>
  vi.mocked(useQuery).mockReturnValue([
    { data: { launchesPast: launches }, fetching: false, error: undefined },
    vi.fn(),
  ] as any)

describe('usePaginatedLaunches', () => {
  beforeEach(() => mockSuccess([mockLaunch]))

  it('returns launches from the query result', () => {
    const { result } = renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 1, pageSize: 5 })
    )
    expect(result.current.launches).toHaveLength(1)
    expect(result.current.launches[0].mission_name).toBe('Starlink 6-14')
  })

  it('returns an empty array while fetching', () => {
    vi.mocked(useQuery).mockReturnValue([
      { data: undefined, fetching: true, error: undefined },
      vi.fn(),
    ] as any)
    const { result } = renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 1, pageSize: 5 })
    )
    expect(result.current.launches).toEqual([])
    expect(result.current.fetching).toBe(true)
  })

  it('calculates offset as (page - 1) * pageSize', () => {
    mockSuccess([mockLaunch])
    renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 3, pageSize: 10 })
    )
    expect(vi.mocked(useQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ offset: 20, limit: 10 }),
      })
    )
  })

  it('maps sort field "date" to "launch_date_local"', () => {
    renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'asc', page: 1, pageSize: 5 })
    )
    expect(vi.mocked(useQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ sort: 'launch_date_local', order: 'asc' }),
      })
    )
  })

  it('maps sort field "name" to "mission_name"', () => {
    renderHook(() =>
      usePaginatedLaunches({ sort: 'name', direction: 'asc', page: 1, pageSize: 5 })
    )
    expect(vi.mocked(useQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ sort: 'mission_name' }),
      })
    )
  })

  it('maps sort field "status" to "launch_success"', () => {
    renderHook(() =>
      usePaginatedLaunches({ sort: 'status', direction: 'desc', page: 1, pageSize: 5 })
    )
    expect(vi.mocked(useQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ sort: 'launch_success' }),
      })
    )
  })

  it('returns hasMore true when result count equals pageSize', () => {
    mockSuccess(fullBatch)
    const { result } = renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 1, pageSize: 20 })
    )
    expect(result.current.hasMore).toBe(true)
  })

  it('returns hasMore false when result count is less than pageSize', () => {
    mockSuccess([mockLaunch])
    const { result } = renderHook(() =>
      usePaginatedLaunches({ sort: 'date', direction: 'desc', page: 1, pageSize: 5 })
    )
    expect(result.current.hasMore).toBe(false)
  })
})
