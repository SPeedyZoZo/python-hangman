import { expect, fakeMic, test } from './helpers.ts';

test.use(fakeMic('strum-am.wav'));

test('Check my chord rejects Am when Em is expected and gives a hint (FR-DET-4)', async ({
  page,
}) => {
  await page.goto('/#/chords/Em');
  await page.getByRole('button', { name: 'Start checking' }).click();
  await expect(page.getByTestId('chord-verdict')).toHaveText(/Not quite/, { timeout: 15_000 });
});

test('E minor lesson does not advance on Am strums', async ({ page }) => {
  await page.goto('/#/play/lesson/u3-em');
  await page.getByRole('button', { name: "Let's play" }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Not quite Em' })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page).not.toHaveURL(/results/);
});
