import { render, screen } from '@testing-library/react'
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger'

// IntersectionObserver is a browser API not available in jsdom.
// We replace it with a mock that tracks calls so tests can assert on
// observer lifecycle without running a real browser.
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe = mockObserve
    disconnect = mockDisconnect
    unobserve = vi.fn()
    constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
  })
  mockObserve.mockClear()
  mockDisconnect.mockClear()
})

describe('InfiniteScrollTrigger', () => {
  it('renders nothing when hasMore is false', () => {
    const { container } = render(
      <InfiniteScrollTrigger onTrigger={vi.fn()} hasMore={false} fetching={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('attaches an IntersectionObserver when hasMore is true', () => {
    render(<InfiniteScrollTrigger onTrigger={vi.fn()} hasMore={true} fetching={false} />)
    expect(mockObserve).toHaveBeenCalled()
  })

  it('shows a loading spinner when fetching is true', () => {
    render(<InfiniteScrollTrigger onTrigger={vi.fn()} hasMore={true} fetching={true} />)
    expect(screen.getByLabelText('Loading more launches')).toBeInTheDocument()
  })

  it('does not show a spinner when not fetching', () => {
    render(<InfiniteScrollTrigger onTrigger={vi.fn()} hasMore={true} fetching={false} />)
    expect(screen.queryByLabelText('Loading more launches')).not.toBeInTheDocument()
  })

  it('disconnects the observer when unmounted', () => {
    const { unmount } = render(
      <InfiniteScrollTrigger onTrigger={vi.fn()} hasMore={true} fetching={false} />
    )
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })
})
