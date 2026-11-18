import { expect, test } from './helpers.ts';

test.use({ settings: { virtualInput: true } });

test.describe('On-screen guitar without a microphone (FR-ONB-4, FR-SET-3)', () => {
  test('a lesson can be played by tapping the fretboard', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/#/play/lesson/u1-open-e');
    await page.getByRole('button', { name: "Let's play" }).click();
    await expect(page.getByText('On-screen guitar mode')).toBeVisible();
    const openE = page.getByRole('button', { name: 'String 1 (e), open: E4' });
    for (let i = 0; i < 60 && !/results/.test(page.url()); i++) {
      // The last pluck navigates to Results, which removes the button mid-click: don't wait on it.
      await openE.click({ timeout: 2_000 }).catch(() => undefined);
      await page.waitForTimeout(700);
    }
    await expect(page).toHaveURL(/#\/results/);
    await expect(page.getByText('Wrong attempts')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Coach tips' })).toBeVisible();
  });
});
