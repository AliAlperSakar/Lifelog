import { expect, test } from '@playwright/test'

/**
 * Covers the required acceptance flow (spec §87): launch, demo data,
 * add/edit/delete a food entry with totals updating each time, and
 * persistence across a reload (proves data lives in IndexedDB, not just
 * React state — a full page reload discards all JS memory).
 */

test.describe('core acceptance flow', () => {
  test('launch, demo data, add/edit/delete banana, persists across reload', async ({ page }) => {
    await page.goto('/')

    // Database initializes, Today loads, demo entries appear.
    await expect(page.getByRole('main').getByText('Today', { exact: true })).toBeVisible()
    await expect(page.getByText('2 croissants')).toBeVisible()

    // Approximate daily totals appear (demo day totals ~kcal).
    const kcalText = page.locator('text=/~?\\d[\\d,]* kcal/').first()
    await expect(kcalText).toBeVisible()
    const totalsBefore = await kcalText.textContent()

    // Open Quick Log -> Food.
    await page.getByRole('button', { name: 'Log something' }).click()
    await page.getByRole('button', { name: 'Food' }).click()

    await page.getByLabel('What did you eat?').fill('Banana')
    await page.getByLabel('Calories').fill('105')
    await page.getByLabel('Protein (g)').fill('1.3')
    await page.getByLabel('Carbs (g)').fill('27')
    await page.getByLabel('Fat (g)').fill('0.3')
    await page.getByLabel('Fiber (g)').fill('3.1')
    await page.getByLabel('Sugar (g)').fill('14')
    await page.getByRole('button', { name: 'Save' }).click()

    // Banana appears in the timeline and totals updated.
    await expect(page.getByText('Banana', { exact: true })).toBeVisible()
    await expect(kcalText).not.toHaveText(totalsBefore ?? '')

    // Reload — data must come back from IndexedDB, not React state.
    await page.reload()
    await expect(page.getByText('Banana', { exact: true })).toBeVisible()

    // Edit Banana's calories.
    await page.getByText('Banana', { exact: true }).click()
    const caloriesField = page.getByLabel('Calories')
    await expect(caloriesField).toHaveValue('105')
    await caloriesField.fill('120')
    await page.getByRole('button', { name: 'Save' }).click()
    // Default provenance is "approximate", so the timeline shows "~120 kcal".
    await expect(page.getByText('~120 kcal')).toBeVisible()

    // Delete Banana (requires a confirming second tap).
    await page.getByText('Banana', { exact: true }).click()
    const deleteButton = page.getByRole('button', { name: 'Delete entry' })
    await deleteButton.click()
    await page.getByRole('button', { name: 'Confirm delete' }).click()
    await expect(page.getByText('Banana', { exact: true })).not.toBeVisible()

    // Totals returned to the pre-banana state.
    await expect(kcalText).toHaveText(totalsBefore ?? '')
  })

  test('History, Trends, and report navigation all render', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'History' }).click()
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible()
    await expect(page.getByText('2 croissants')).toBeVisible()

    await page.getByRole('link', { name: 'Trends' }).click()
    await expect(page.getByRole('heading', { name: 'Trends' })).toBeVisible()

    await page.goto('/')
    await page.getByRole('link', { name: 'Report' }).click()
    await expect(page.getByRole('heading', { name: /August/ })).toBeVisible()
    await expect(page.getByText('What went well')).toBeVisible()
  })

  test('backup export downloads a JSON file', async ({ page }) => {
    await page.goto('/settings')
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export backup (JSON)' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/lifelog-backup-.*\.json/)
  })
})
