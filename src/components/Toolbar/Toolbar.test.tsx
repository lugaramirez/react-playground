import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toolbar } from './Toolbar'

// Default props for Toolbar — override per test as needed.
const defaults = {
  sort: 'date' as const,
  direction: 'desc' as const,
  pageSize: 5 as const,
  onSortChange: vi.fn(),
  onPageSizeChange: vi.fn(),
}

describe('Toolbar', () => {
  it('renders all three sort buttons', () => {
    render(<Toolbar {...defaults} />)
    expect(screen.getByText(/Date/)).toBeInTheDocument()
    expect(screen.getByText(/Name/)).toBeInTheDocument()
    expect(screen.getByText(/Status/)).toBeInTheDocument()
  })

  it('renders all four page size buttons', () => {
    render(<Toolbar {...defaults} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('∞')).toBeInTheDocument()
  })

  it('shows descending arrow on the active sort button', () => {
    render(<Toolbar {...defaults} sort="date" direction="desc" />)
    expect(screen.getByText('Date ↓')).toBeInTheDocument()
  })

  it('shows ascending arrow on the active sort button', () => {
    render(<Toolbar {...defaults} sort="date" direction="asc" />)
    expect(screen.getByText('Date ↑')).toBeInTheDocument()
  })

  it('toggles direction when clicking the already-active sort button', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(<Toolbar {...defaults} sort="date" direction="desc" onSortChange={onSortChange} />)
    await user.click(screen.getByText('Date ↓'))
    expect(onSortChange).toHaveBeenCalledWith('date', 'asc')
  })

  it('calls onSortChange with desc when switching to a new sort field', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()
    render(<Toolbar {...defaults} sort="date" onSortChange={onSortChange} />)
    await user.click(screen.getByText('Name'))
    expect(onSortChange).toHaveBeenCalledWith('name', 'desc')
  })

  it('calls onPageSizeChange with the correct number when a size button is clicked', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(<Toolbar {...defaults} onPageSizeChange={onPageSizeChange} />)
    await user.click(screen.getByText('10'))
    expect(onPageSizeChange).toHaveBeenCalledWith(10)
  })

  it('calls onPageSizeChange with "infinite" when ∞ is clicked', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(<Toolbar {...defaults} onPageSizeChange={onPageSizeChange} />)
    await user.click(screen.getByText('∞'))
    expect(onPageSizeChange).toHaveBeenCalledWith('infinite')
  })
})
