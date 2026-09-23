import { expect, test } from '@playwright/test'

test('operator demo: forecast, deviation, recovery, historical replay and copilot', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByText('Favourable generation conditions')).toBeVisible()
  await page.screenshot({ path: '.test-artifacts/overview-desktop.png', fullPage: true })
  await page.getByRole('button', { name: '24h', exact: true }).click()
  await expect(page.getByText('Expected output across the next 24 hours')).toBeVisible()
  await page.getByRole('button', { name: '48h', exact: true }).click()
  await page.getByRole('button', { name: 'Forecast confidence breakdown' }).hover()
  await expect(page.getByText('System confidence breakdown')).toBeVisible()
  await page.mouse.move(800, 50)
  await page.locator('.forecast-chart .recharts-wrapper').click({ position: { x: 310, y: 120 } })
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Why this forecast?' })).toBeVisible()
  await page.getByRole('button', { name: 'View similar periods' }).click()
  await expect(page.getByText('EXAMPLE ARCHIVE MATCHES')).toBeVisible()
  await page.getByRole('button', { name: 'Close panel' }).click()
  await page.getByRole('link', { name: '48h Forecast' }).click()
  await expect(page.getByRole('heading', { name: 'Predicted power' })).toBeVisible()
  await page.getByRole('button', { name: '24 Hours' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(24)
  await page.getByRole('button', { name: 'WT-01', exact: true }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export forecast' }).click()
  expect((await download).suggestedFilename()).toBe('windops-forecast.csv')
  await page.getByRole('link', { name: 'Overview', exact: true }).click()
  await page.getByLabel('DEMO SCENARIO').selectOption('deviation')
  await expect(page.getByText('WT-02 behaviour deviation', { exact: true })).toBeVisible()
  await expect(page.getByLabel('DEMO SCENARIO')).toBeEnabled()
  await page.getByRole('link', { name: 'Turbine Twin' }).click()
  await expect(page.getByText('Potential underperformance detected on WT-02.')).toBeVisible()
  await page.screenshot({ path: '.test-artifacts/twin-deviation.png', fullPage: true })
  await page.getByRole('button', { name: 'Ask WindOps AI', exact: true }).click()
  await page.getByRole('button', { name: 'Are there any anomalies?' }).click()
  await expect(page.getByText(/observed 24%/)).toBeVisible()
  await page.getByRole('button', { name: 'Close panel' }).click()
  await page.getByRole('link', { name: 'AI Agent LIVE' }).click()
  await page.getByRole('button', { name: 'Simulate API failure' }).click()
  await expect(page.getByText('Primary weather source unavailable', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('MEDIUM → MEDIUM · system confidence 76/100')).toBeVisible()
  await expect(page.getByLabel('DEMO SCENARIO')).toBeEnabled()
  await expect(page.getByText('Backup source connected', { exact: true })).toBeVisible()
  await page.screenshot({ path: '.test-artifacts/agent-recovery.png', fullPage: true })
  await page.getByRole('button', { name: 'Simulate weather update' }).click()
  await expect(page.getByText(/Next 6h expected generation changed by/)).toBeVisible()
  await expect(page.getByLabel('DEMO SCENARIO')).toBeEnabled()
  await page.getByRole('link', { name: 'Historical Replay' }).click()
  await page.getByRole('button', { name: 'Run Historical Forecast' }).click()
  await expect(page.getByText('NO FUTURE DATA USED ✓')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Historical 48-hour prediction' })).toBeVisible()
  await page.screenshot({ path: '.test-artifacts/replay.png', fullPage: true })
  await page.getByLabel('Forecast date').fill('2025-12-31')
  await page.getByLabel('Origin time · UTC').fill('00:05')
  await expect(page.getByText('NO FUTURE DATA USED ✓')).toHaveCount(0)
  await page.getByRole('button', { name: 'Run Historical Forecast' }).click()
  await expect(page.getByText('30 Dec · 23:47 UTC')).toBeVisible()
  await page.getByRole('link', { name: 'Diagnostics' }).click()
  await expect(page.getByText('Demo metrics / validation example')).toBeVisible()
  expect(errors).toEqual([])
})

test('mobile navigation and every page fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByText('Favourable generation conditions')).toBeVisible()
  await page.screenshot({ path: '.test-artifacts/overview-mobile.png', fullPage: true })
  for (const name of [
    '48h Forecast',
    'Turbine Twin',
    'AI Agent LIVE',
    'Historical Replay',
    'Diagnostics',
    'Overview',
  ]) {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await page.getByRole('link', { name, exact: true }).click()
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('checkbox', { name: 'Reduce motion' }).check()
  await expect(page.locator('html')).toHaveClass(/reduce-motion/)
  await page.getByRole('button', { name: 'Close panel' }).click()
})

test('uncertainty, notifications and historical scenario remain consistent', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Favourable generation conditions')).toBeVisible()
  await page.getByLabel('DEMO SCENARIO').selectOption('uncertainty')
  await expect(page.getByText('Increased forecast uncertainty', { exact: true })).toBeVisible()
  await expect(page.getByLabel('DEMO SCENARIO')).toBeEnabled()
  await expect(page.locator('.confidence .metric-value')).toContainText('62')
  await page.getByRole('button', { name: /Notifications,/ }).click()
  await expect(page.getByText('Updated 48-hour forecast · confidence 62/100.')).toBeVisible()
  await page.getByRole('button', { name: 'Mark all as read' }).click()
  await expect(page.getByText('0 unread operational updates')).toBeVisible()
  await page.getByRole('button', { name: 'Close panel' }).click()
  await page.getByLabel('DEMO SCENARIO').selectOption('replay')
  await expect(page.getByText('HISTORICAL OPERATIONS')).toBeVisible()
  await expect(page.getByLabel('DEMO SCENARIO')).toBeEnabled()
  await page.getByLabel('DEMO SCENARIO').selectOption('normal')
  await expect(page.getByLabel('DEMO SCENARIO')).toBeEnabled()
  await page.getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.locator('.confidence .metric-value')).toContainText('94')
  await expect(page.getByText('No action required', { exact: true })).toBeVisible()
})

test('desktop and tablet overview have no horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Favourable generation conditions')).toBeVisible()
  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [360, 800],
  ]) {
    await page.setViewportSize({ width, height })
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: `.test-artifacts/overview-${width}.png`, fullPage: true })
  }
})
