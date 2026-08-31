import { expect, test } from '@playwright/test'

/** Spec §89: no horizontal overflow at any of the required breakpoints, on
 * the screens that are most likely to overflow (long timeline cards, the
 * Quick Log sheet with its grid of inputs, History's calendar). */

const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
]

for (const vp of VIEWPORTS) {
  test.describe(`no horizontal overflow @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('Today, History, Trends, Quick Log', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByRole('main').getByText('Today', { exact: true })).toBeVisible()
      await assertNoHorizontalOverflow(page)

      await page.goto('/history')
      await assertNoHorizontalOverflow(page)

      await page.goto('/trends')
      await assertNoHorizontalOverflow(page)

      await page.goto('/')
      const logButtons = page.getByRole('button', { name: 'Log something' })
      await logButtons.first().click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await assertNoHorizontalOverflow(page)
    })
  })
}

async function assertNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}
