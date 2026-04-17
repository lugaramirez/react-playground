import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fetchLaunches } from '../../api/launches'
import { LaunchesPage } from './LaunchesPage'
import { mockLaunch } from '../../test/mocks'

vi.mock('../../api/launches', () => ({ fetchLaunches: vi.fn() }))

// IntersectionObserver is not available in jsdom.
vi.stubGlobal('IntersectionObserver', class {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
})

beforeEach(() => {
  vi.mocked(fetchLaunches).mockResolvedValue([mockLaunch])
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

  it('renders the launch list', async () => {
    render(<LaunchesPage />)
    expect(await screen.findByText('Starlink 6-14')).toBeInTheDocument()
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
    await screen.findByText('Starlink 6-14')
    await user.click(screen.getByText('Name'))
    await waitFor(() =>
      expect(vi.mocked(fetchLaunches)).toHaveBeenCalledWith(5, 0, 'name', 'desc')
    )
  })

  it('passes correct limit when page size changes to 10', async () => {
    const user = userEvent.setup()
    render(<LaunchesPage />)
    await screen.findByText('Starlink 6-14')
    await user.click(screen.getByText('10'))
    await waitFor(() =>
      expect(vi.mocked(fetchLaunches)).toHaveBeenCalledWith(10, 0, 'date_local', 'desc')
    )
  })
})
