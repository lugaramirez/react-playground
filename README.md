# react-playground

A learning project for exploring React patterns. **Not intended for production use.**

Built with Vite + React + TypeScript, Tailwind CSS v4, and Vitest.

---

## Running the app

```bash
npm install          # install dependencies (first time only)
npm run dev:mock     # start dev server with mock data (no network calls)
npm run dev          # start dev server against the real SpaceX API
```

### Other commands

```bash
npm test                  # run all Vitest tests once (unit + integration)
npm run test:unit         # run only unit tests
npm run test:integration  # run only integration tests (full component pipeline)
npm run test:e2e          # run Playwright e2e tests (starts dev server automatically)
npm run test:all          # run all three test suites in sequence
npm run test:watch        # re-run tests on file save
npm run build             # production build (output in dist/)
npm run lint              # run ESLint
```

### Mock vs live data

The app fetches from the SpaceX REST API v4 (`https://api.spacexdata.com/v4/launches/query`). `dev:mock` sets the `VITE_USE_MOCK=true` environment variable, which swaps in a local data layer (`src/data/mockExchange.ts`) that returns static launches without making any network calls. Update the URL in `src/api/launches.ts` if the endpoint changes.

---

## File structure

```
src/
  App.tsx                        # Root component — renders LaunchesPage
  main.tsx                       # Entry point — mounts App into the DOM
  index.css                      # Tailwind CSS import

  types/
    launch.ts                    # Shared TypeScript types (Launch, SortField, PageSize, …)

  utils/
    sortFieldMap.ts              # Maps UI sort labels to SpaceX REST API field names

  api/
    launches.ts                  # REST client — fetches from SpaceX v4 API or mock,
                                 # transforms response to the Launch domain type

  data/
    mockLaunches.ts              # 25 static Launch objects used in dev and tests
    mockExchange.ts              # queryMockData — pure sort+slice function used by
                                 # api/launches.ts when VITE_USE_MOCK=true

  hooks/
    usePaginatedLaunches.ts      # Fetches one page at a time (limit/offset)
    useInfiniteLaunches.ts       # Accumulates pages for infinite scroll

  components/
    LaunchCard/                  # Renders a single launch row
    LaunchList/                  # Renders the list + loading / error / empty states
    Toolbar/                     # Sort buttons and page size selector
    Pagination/                  # Prev / Next buttons
    InfiniteScrollTrigger/       # Fires fetchMore when scrolled into view

  pages/
    LaunchesPage/                # Owns all UI state; composes everything above

  test/
    setup.ts                     # Vitest + jest-dom setup
    mocks.ts                     # Shared mock Launch objects used across tests

e2e/
  launches.spec.ts               # Playwright end-to-end tests (page load, pagination,
                                 # sorting, infinite scroll) — run with npm run test:e2e
```
