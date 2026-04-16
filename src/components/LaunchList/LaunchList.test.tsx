import { render, screen } from '@testing-library/react'
import { LaunchList } from './LaunchList'
import { mockLaunch, mockFailedLaunch } from '../../test/mocks'

describe('LaunchList', () => {
  it('renders a card for each launch', () => {
    render(<LaunchList launches={[mockLaunch, mockFailedLaunch]} fetching={false} error={undefined} />)
    expect(screen.getByText('Starlink 6-14')).toBeInTheDocument()
    expect(screen.getByText('Demo Mission 1')).toBeInTheDocument()
  })

  it('shows a loading spinner when fetching with no data yet', () => {
    render(<LaunchList launches={[]} fetching={true} error={undefined} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('does not show spinner when fetching but already has data (infinite scroll top-up)', () => {
    render(<LaunchList launches={[mockLaunch]} fetching={true} error={undefined} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('Starlink 6-14')).toBeInTheDocument()
  })

  it('shows an error message when an error is passed', () => {
    render(<LaunchList launches={[]} fetching={false} error={new Error('Network error')} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })

  it('shows an empty state when there are no launches and no error', () => {
    render(<LaunchList launches={[]} fetching={false} error={undefined} />)
    expect(screen.getByText('No launches found.')).toBeInTheDocument()
  })
})
