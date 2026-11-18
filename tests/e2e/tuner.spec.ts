import { expect, fakeMic, test } from './helpers.ts';

test.use(fakeMic('tuner-e2.wav'));

test('tuner hears a low E through the (fake) microphone', async ({ page }) => {
  await page.goto('/#/tuner');
  await page.getByRole('button', { name: 'Start listening' }).click();
  const live = page.getByTestId('tuner-live');
  await expect(live.getByText('Listening through your microphone')).toBeVisible();
  await expect(live.getByText(/String 6 \(E\)/)).toBeVisible({ timeout: 15_000 });
  await expect(live.getByRole('img', { name: /^E2,/ })).toBeVisible();
});
