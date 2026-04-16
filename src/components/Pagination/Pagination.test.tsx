import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('displays the current page number', () => {
    render(<Pagination page={5} hasMore={true} onPageChange={vi.fn()} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('disables the Prev button on page 1', () => {
    render(<Pagination page={1} hasMore={true} onPageChange={vi.fn()} />)
    expect(screen.getByText('← Prev')).toBeDisabled()
  })

  it('enables the Prev button on pages after the first', () => {
    render(<Pagination page={2} hasMore={true} onPageChange={vi.fn()} />)
    expect(screen.getByText('← Prev')).not.toBeDisabled()
  })

  it('disables the Next button when hasMore is false', () => {
    render(<Pagination page={1} hasMore={false} onPageChange={vi.fn()} />)
    expect(screen.getByText('Next →')).toBeDisabled()
  })

  it('enables the Next button when hasMore is true', () => {
    render(<Pagination page={1} hasMore={true} onPageChange={vi.fn()} />)
    expect(screen.getByText('Next →')).not.toBeDisabled()
  })

  it('calls onPageChange with page - 1 when Prev is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={3} hasMore={true} onPageChange={onPageChange} />)
    await user.click(screen.getByText('← Prev'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with page + 1 when Next is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={2} hasMore={true} onPageChange={onPageChange} />)
    await user.click(screen.getByText('Next →'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
