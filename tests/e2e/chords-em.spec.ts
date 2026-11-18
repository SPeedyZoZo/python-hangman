import { expect, test } from '@playwright/test';
import { fakeMic } from './helpers.ts';

test.use(fakeMic('strum-em.wav'));

test('E minor lesson accepts strummed Em chords (FR-DET-2)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/#/play/lesson/u3-em');
  await page.getByRole('button', { name: "Let's play" }).click();
  await page.waitForURL(/#\/results/, { timeout: 60_000 });
  await expect(page.getByText('Wrong attempts')).toBeVisible();
});

test('Check my chord recognises Em', async ({ page }) => {
  await page.goto('/#/chords/Em');
  await page.getByRole('button', { name: 'Start checking' }).click();
  await expect(page.getByTestId('chord-verdict')).toHaveText(/Sounds like Em!/, {
    timeout: 15_000,
  });
});
