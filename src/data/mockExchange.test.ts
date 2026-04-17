import { queryMockData } from './mockExchange'

// These tests cover the data layer that the hook unit tests never reach.
// The hook tests mock fetchLaunches directly, so the sort/slice logic in this file
// was previously untested — which is exactly why the pagination and sorting
// bugs went undetected.

describe('queryMockData — pagination', () => {
  it('returns exactly limit items', () => {
    expect(queryMockData({ limit: 5 })).toHaveLength(5)
    expect(queryMockData({ limit: 10 })).toHaveLength(10)
    expect(queryMockData({ limit: 20 })).toHaveLength(20)
  })

  it('returns a different set of items on the second page', () => {
    const page1 = queryMockData({ limit: 5, offset: 0 }).map(l => l.id)
    const page2 = queryMockData({ limit: 5, offset: 5 }).map(l => l.id)
    expect(page1).not.toEqual(page2)
    expect(page1.some(id => page2.includes(id))).toBe(false)
  })

  it('returns a partial last page when fewer items remain', () => {
    // 25 total items — offset 20 leaves 5 remaining
    expect(queryMockData({ limit: 20, offset: 20 })).toHaveLength(5)
  })

  it('returns an empty array when offset exceeds total items', () => {
    expect(queryMockData({ limit: 20, offset: 100 })).toHaveLength(0)
  })
})

describe('queryMockData — sorting', () => {
  it('defaults to date descending — most recent launch is first', () => {
    const results = queryMockData({ limit: 5 })
    expect(results[0].mission_name).toBe('Starlink 6-14')
  })

  it('date ascending — oldest launch is first', () => {
    const results = queryMockData({ limit: 5, sort: 'date_local', order: 'asc' })
    // Demo Mission 1 and FalconSat share the oldest date; stable sort preserves
    // insertion order so Demo Mission 1 (earlier in the array) comes first.
    expect(results[0].mission_name).toBe('Demo Mission 1')
  })

  it('name descending — Z comes first', () => {
    const results = queryMockData({ limit: 5, sort: 'name', order: 'desc' })
    expect(results[0].mission_name).toBe('Zuma')
  })

  it('name ascending — A comes first', () => {
    const results = queryMockData({ limit: 5, sort: 'name', order: 'asc' })
    expect(results[0].mission_name).toBe('Arabsat-6A')
  })

  it('status descending — successful launches come first', () => {
    const results = queryMockData({ limit: 25, sort: 'success', order: 'desc' })
    expect(results[0].launch_success).toBe(true)
    expect(results[results.length - 1].launch_success).toBe(false)
  })

  it('status ascending — failed launches come first', () => {
    const results = queryMockData({ limit: 25, sort: 'success', order: 'asc' })
    expect(results[0].launch_success).toBe(false)
  })

  it('unknown launches (null) appear between success and failed in status sort', () => {
    const results = queryMockData({ limit: 25, sort: 'success', order: 'desc' })
    const statuses = results.map(l => l.launch_success)
    const nullIndex = statuses.indexOf(null)
    const firstFalseIndex = statuses.indexOf(false)
    // null should appear after all trues and before all falses
    expect(nullIndex).toBeGreaterThan(0)
    expect(nullIndex).toBeLessThan(firstFalseIndex)
  })
})
