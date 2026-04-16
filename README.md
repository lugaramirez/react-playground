# react-playground

A learning project for exploring React patterns. **Not intended for production use.**

Built with Vite + React + TypeScript, urql (GraphQL), Tailwind CSS v4, and Vitest.

---

## Running the app

```bash
npm install       # install dependencies (first time only)
npm run dev       # start dev server at http://localhost:5173
```

### Other commands

```bash
npm test              # run all tests once
npm run test:watch    # re-run tests on file save
npm run build         # production build (output in dist/)
npm run lint          # run ESLint
```

---

## File structure

```
src/
  App.tsx                        # Root component — sets up the urql GraphQL client
  main.tsx                       # Entry point — mounts App into the DOM
  index.css                      # Tailwind CSS import

  types/
    launch.ts                    # Shared TypeScript types (Launch, SortField, PageSize, …)

  utils/
    sortFieldMap.ts              # Maps UI sort labels to GraphQL field names

  queries/
    launches.ts                  # The GraphQL query sent to the SpaceX API

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
```
