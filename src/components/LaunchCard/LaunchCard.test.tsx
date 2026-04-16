import { render, screen } from '@testing-library/react'
import { LaunchCard } from './LaunchCard'
import { mockLaunch, mockFailedLaunch } from '../../test/mocks'

describe('LaunchCard', () => {
  it('renders the mission name', () => {
    render(<LaunchCard launch={mockLaunch} />)
    expect(screen.getByText('Starlink 6-14')).toBeInTheDocument()
  })

  it('renders the rocket name', () => {
    render(<LaunchCard launch={mockLaunch} />)
    expect(screen.getByText(/Falcon 9/)).toBeInTheDocument()
  })

  it('renders a formatted date (not the raw ISO string)', () => {
    render(<LaunchCard launch={mockLaunch} />)
    // Use a flexible regex — the exact day can shift by timezone in the test runner.
    // We just need to confirm the date is human-readable (contains month + year),
    // not that we're showing the raw ISO string.
    expect(screen.getByText(/Jul.*2023/)).toBeInTheDocument()
    expect(screen.queryByText('2023-07-24T15:45:00-04:00')).not.toBeInTheDocument()
  })

  it('shows "Success" badge for a successful launch', () => {
    render(<LaunchCard launch={mockLaunch} />)
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('shows "Failed" badge for a failed launch', () => {
    render(<LaunchCard launch={mockFailedLaunch} />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('shows "Unknown" badge when launch_success is null', () => {
    render(<LaunchCard launch={{ ...mockLaunch, launch_success: null }} />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('renders mission patch image when available', () => {
    const withPatch = {
      ...mockLaunch,
      links: { mission_patch_small: 'https://example.com/patch.png' },
    }
    render(<LaunchCard launch={withPatch} />)
    expect(screen.getByAltText('Starlink 6-14 patch')).toBeInTheDocument()
  })

  it('renders a rocket emoji fallback when no patch is available', () => {
    render(<LaunchCard launch={mockLaunch} />)
    // mockLaunch has links.mission_patch_small: null
    expect(screen.getByText('🚀')).toBeInTheDocument()
  })
})
