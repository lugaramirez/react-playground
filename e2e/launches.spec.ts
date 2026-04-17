import { test, expect } from '@playwright/test'

// These tests exercise the full browser stack: real DOM, real urql client,
// real mockExchange. They are the slowest tests in the suite but give the
// highest confidence that the app works as a user experiences it.
//
// Note: these are also the tests that would have caught the pagination and
// sorting bugs before any manual testing was needed.

test.describe('page loads', () => {
  test('shows the page heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('SpaceX Launches')).toBeVisible()
  })

  test('shows the toolbar with sort and page size buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Date ↓' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Name' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Status' })).toBeVisible()
    await expect(page.getByRole('button', { name: '5' })).toBeVisible()
  })
})

test.describe('pagination', () => {
  test('shows 5 launches by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('listitem')).toHaveCount(5)
  })

  test('shows 10 launches when page size 10 is selected', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '10' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(10)
  })

  test('shows 20 launches when page size 20 is selected', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '20' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(20)
  })

  test('Next navigates to a different page of results', async ({ page }) => {
    await page.goto('/')
    const firstItem = await page.getByRole('listitem').first().textContent()
    await page.getByRole('button', { name: 'Next →' }).click()
    const secondPageFirst = await page.getByRole('listitem').first().textContent()
    expect(secondPageFirst).not.toBe(firstItem)
  })

  test('Prev returns to the previous page', async ({ page }) => {
    await page.goto('/')
    // textContent() matches what toContainText() checks internally — no whitespace mismatch.
    const firstItemText = await page.getByRole('listitem').first().textContent()
    await page.getByRole('button', { name: 'Next →' }).click()
    await page.getByRole('button', { name: '← Prev' }).click()
    await expect(page.getByRole('listitem').first()).toContainText(firstItemText!.slice(0, 20))
  })

  test('Prev button is disabled on page 1', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: '← Prev' })).toBeDisabled()
  })
})

test.describe('sorting', () => {
  test('sorts by date descending by default — most recent launch is first', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('listitem').first()).toContainText('Starlink 6-14')
  })

  test('sorts by name descending when Name is clicked — Zuma is first', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Name' }).click()
    await expect(page.getByRole('listitem').first()).toContainText('Zuma')
  })

  test('sorts by name ascending when Name is clicked twice — Arabsat-6A is first', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Name' }).click()
    await page.getByRole('button', { name: 'Name ↓' }).click()
    await expect(page.getByRole('listitem').first()).toContainText('Arabsat-6A')
  })

  test('direction arrow updates when sort is toggled', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Name' }).click()
    await expect(page.getByRole('button', { name: 'Name ↓' })).toBeVisible()
    await page.getByRole('button', { name: 'Name ↓' }).click()
    await expect(page.getByRole('button', { name: 'Name ↑' })).toBeVisible()
  })
})

test.describe('infinite scroll mode', () => {
  test('hides Prev/Next when ∞ is selected', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '∞' }).click()
    await expect(page.getByRole('button', { name: '← Prev' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Next →' })).not.toBeVisible()
  })

  test('shows launches in infinite scroll mode', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '∞' }).click()
    await expect(page.getByRole('listitem').first()).toBeVisible()
  })
})
