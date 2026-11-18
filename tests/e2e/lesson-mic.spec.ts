import { expect, fakeMic, test } from './helpers.ts';

test.use(fakeMic('pluck-e4.wav'));

test.describe('Wait Mode lesson through the microphone (FR-PLY-2)', () => {
  test('Lesson 1 completes with 3 stars from repeated open-e plucks', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/#/play/lesson/u1-open-e');
    await page.getByRole('button', { name: "Let's play" }).click();
    await expect(page.getByText('Listening through your microphone')).toBeVisible();
    await page.waitForURL(/#\/results/, { timeout: 60_000 });
    await expect(page.getByRole('img', { name: '3 of 3 stars' }).first()).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();
    await page.getByRole('link', { name: 'Next lesson' }).click();
    await expect(page.getByRole('heading', { name: 'B and e' })).toBeVisible();
  });
});
