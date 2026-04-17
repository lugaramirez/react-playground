import { fetchLaunches } from './launches'

// These tests verify the HTTP call shape. The integration tests mock fetchLaunches
// entirely, so bugs in the request body (wrong field names, bad transforms) would
// otherwise go undetected until the real app is run.

const mockDoc = {
  id: 'abc123',
  name: 'Starlink 6-14',
  date_local: '2023-07-24T09:15:00-04:00',
  success: true,
  rocket: { name: 'Falcon 9' },
  links: { patch: { small: 'https://example.com/patch.png' } },
}

function mockFetch(body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ docs: [body] }),
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchLaunches — request body', () => {
  it('sends offset (not skip) for pagination', async () => {
    mockFetch(mockDoc)
    await fetchLaunches(5, 10, 'date_local', 'desc')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.options.offset).toBe(10)
    expect(body.options.skip).toBeUndefined()
  })

  it('sends limit', async () => {
    mockFetch(mockDoc)
    await fetchLaunches(5, 0, 'date_local', 'desc')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.options.limit).toBe(5)
  })

  it('sends sort field and order', async () => {
    mockFetch(mockDoc)
    await fetchLaunches(5, 0, 'name', 'asc')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.options.sort).toEqual({ name: 'asc' })
  })

  it('populates rocket', async () => {
    mockFetch(mockDoc)
    await fetchLaunches(5, 0, 'date_local', 'desc')
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.options.populate).toContain('rocket')
  })
})

describe('fetchLaunches — response transform', () => {
  it('maps REST fields to the Launch domain type', async () => {
    mockFetch(mockDoc)
    const [launch] = await fetchLaunches(1, 0, 'date_local', 'desc')
    expect(launch.id).toBe('abc123')
    expect(launch.mission_name).toBe('Starlink 6-14')
    expect(launch.launch_date_local).toBe('2023-07-24T09:15:00-04:00')
    expect(launch.launch_success).toBe(true)
    expect(launch.rocket?.rocket_name).toBe('Falcon 9')
    expect(launch.links?.mission_patch_small).toBe('https://example.com/patch.png')
  })

  it('handles null rocket', async () => {
    mockFetch({ ...mockDoc, rocket: null })
    const [launch] = await fetchLaunches(1, 0, 'date_local', 'desc')
    expect(launch.rocket).toBeNull()
  })

  it('handles missing patch', async () => {
    mockFetch({ ...mockDoc, links: { patch: { small: null } } })
    const [launch] = await fetchLaunches(1, 0, 'date_local', 'desc')
    expect(launch.links).toBeNull()
  })
})
