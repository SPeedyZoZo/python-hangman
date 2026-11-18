import { expect, test } from './helpers.ts';

test('Ask the coach answers a beginner question offline (FR-RES-4)', async ({ page }) => {
  await page.goto('/#/coach');
  await page.getByLabel('Your question').fill('my fingertips hurt');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByText(/calluses form/)).toBeVisible();
});
