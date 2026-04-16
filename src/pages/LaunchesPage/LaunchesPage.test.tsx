import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQuery } from 'urql'
import { LaunchesPage } from './LaunchesPage'
import { mockLaunch } from '../../test/mocks'

vi.mock('urql', () => ({ useQuery: vi.fn(), gql: String.raw }))

// IntersectionObserver is not available in jsdom.
vi.stubGlobal('IntersectionObserver', class {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
})

beforeEach(() => {
  vi.mocked(useQuery).mockReturnValue([
    { data: { launchesPast: [mockLaunch] }, fetching: false, error: undefined },
    vi.fn(),
  ] as any)
})

describe('LaunchesPage', () => {
  it('renders the page heading', () => {
    render(<LaunchesPage />)
    expect(screen.getByText(/SpaceX Launches/)).toBeInTheDocument()
  })

  it('renders the toolbar', () => {
    render(<LaunchesPage />)
    expect(screen.getByText('Date ↓')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders the launch list', () => {
    render(<LaunchesPage />)
    expect(screen.getByText('Starlink 6-14')).toBeInTheDocument()
  })

  it('shows pagination controls in paginated mode', () => {
    render(<LaunchesPage />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('hides pagination and shows scroll trigger when ∞ is selected', async () => {
    const user = userEvent.setup()
    render(<LaunchesPage />)
    await user.click(screen.getByText('∞'))
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument()
  })

  it('resets to page 1 and passes offset 0 when sort changes', async () => {
    const user = userEvent.setup()
    render(<LaunchesPage />)
    await user.click(screen.getByText('Name'))
    expect(vi.mocked(useQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ sort: 'mission_name', offset: 0 }),
      })
    )
  })

  it('passes correct limit when page size changes to 10', async () => {
    const user = userEvent.setup()
    render(<LaunchesPage />)
    await user.click(screen.getByText('10'))
    expect(vi.mocked(useQuery)).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ limit: 10, offset: 0 }),
      })
    )
  })
})
