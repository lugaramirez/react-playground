import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createClient, Provider } from 'urql'
import { mockExchange } from '../../data/mockExchange'
import { LaunchesPage } from './LaunchesPage'

// Unlike LaunchesPage.test.tsx, this file does NOT mock urql.
// It renders LaunchesPage inside a real urql client backed by mockExchange,
// so the full pipeline runs: component → hook → useQuery → exchange → data.
//
// These are the tests that would have caught the pagination and sorting bugs:
// the unit tests verified that the right variables were *sent*, but never
// checked that the right data was *shown*.

vi.stubGlobal('IntersectionObserver', class {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
})

function renderPage() {
  const client = createClient({ url: '/graphql', exchanges: [mockExchange] })
  return render(
    <Provider value={client}>
      <LaunchesPage />
    </Provider>
  )
}

describe('LaunchesPage integration — pagination', () => {
  it('shows 5 launches by default', async () => {
    renderPage()
    expect(await screen.findAllByRole('listitem')).toHaveLength(5)
  })

  it('shows 10 launches when page size 10 is selected', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findAllByRole('listitem')
    await user.click(screen.getByText('10'))
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')).toHaveLength(10)
    )
  })

  it('shows 20 launches when page size 20 is selected', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findAllByRole('listitem')
    await user.click(screen.getByText('20'))
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')).toHaveLength(20)
    )
  })

  it('shows the next page when Next is clicked', async () => {
    const user = userEvent.setup()
    renderPage()
    const page1 = (await screen.findAllByRole('listitem')).map(el => el.textContent)
    await user.click(screen.getByText('Next →'))
    await waitFor(() => {
      const page2 = screen.getAllByRole('listitem').map(el => el.textContent)
      expect(page2).not.toEqual(page1)
    })
  })
})

describe('LaunchesPage integration — sorting', () => {
  it('shows the most recent launch first by default (date desc)', async () => {
    renderPage()
    await screen.findAllByRole('listitem')
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Starlink 6-14')
  })

  it('sorts by name desc when Name is clicked — Zuma is first', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findAllByRole('listitem')
    await user.click(screen.getByText('Name'))
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Zuma')
    )
  })

  it('sorts by name asc when Name is clicked twice — Arabsat-6A is first', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findAllByRole('listitem')
    await user.click(screen.getByText('Name'))
    await user.click(screen.getByText('Name ↓'))
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Arabsat-6A')
    )
  })

  it('sorts by status desc — successful launches appear first', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findAllByRole('listitem')
    await user.click(screen.getByText('Status'))
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Success')
    )
  })
})
