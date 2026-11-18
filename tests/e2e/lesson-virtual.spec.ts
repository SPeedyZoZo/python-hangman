import { expect, test } from '@playwright/test';

test.describe('On-screen guitar without a microphone (FR-ONB-4, FR-SET-3)', () => {
  test('a lesson can be played by tapping the fretboard', async ({ page }) => {
    test.setTimeout(90_000);
    await page.addInitScript(() => {
      localStorage.setItem(
        'strumly.settings',
        JSON.stringify({ state: { virtualInput: true, onboarded: true }, version: 1 }),
      );
    });
    await page.goto('/#/play/lesson/u1-open-e');
    await page.getByRole('button', { name: "Let's play" }).click();
    await expect(page.getByText('On-screen guitar mode')).toBeVisible();
    const openE = page.getByRole('button', { name: 'String 1 (e), open: E4' });
    for (let i = 0; i < 60 && !/results/.test(page.url()); i++) {
      await openE.click();
      await page.waitForTimeout(700);
    }
    await expect(page).toHaveURL(/#\/results/);
    await expect(page.getByText('Wrong attempts')).toBeVisible();
  });
});
